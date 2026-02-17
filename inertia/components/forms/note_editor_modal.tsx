import { useEffect, useRef, useState } from 'react'
import { Modal, Input, Button, Form } from 'antd'
import { router } from '@inertiajs/react'
import type { Note } from '~/lib/types'
import type { Dayjs } from 'dayjs'
import { toISODate } from '~/lib/date_utils'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'

// ─── Inner editor component ───────────────────────────────────────────────────
// Mounted only when the modal is open, so useEffect([]) fires once the
// container div is actually in the DOM (avoids the Ant Design Modal lazy-mount
// timing issue where the parent's useEffect([open]) runs before children exist).
function ToastEditorInner({
  initialContent,
  editorInstanceRef,
  onEditorChangeRef,
}: {
  initialContent: string
  editorInstanceRef: React.MutableRefObject<Editor | null>
  onEditorChangeRef: React.MutableRefObject<() => void>
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const editor = new Editor({
      el: containerRef.current,
      height: '400px',
      initialEditType: 'wysiwyg',
      hideModeSwitch: true,
      toolbarItems: [
        ['heading', 'bold', 'italic', 'strike'],
        ['hr', 'quote'],
        ['ul', 'ol', 'task', 'indent', 'outdent'],
        ['table', 'image', 'link'],
        ['code', 'codeblock'],
      ],
      initialValue: initialContent,
      events: {
        change: () => onEditorChangeRef.current(),
      },
    })
    editorInstanceRef.current = editor
    return () => {
      editor.destroy()
      editorInstanceRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} />
}

// ─── Main modal component ─────────────────────────────────────────────────────
interface NoteEditorModalProps {
  open: boolean
  onClose: () => void
  note?: Note | null
  selectedDate?: Dayjs
  reloadOnly?: string[]
}

export default function NoteEditorModal({
  open,
  onClose,
  note,
  selectedDate,
  reloadOnly = ['notesToday'],
}: NoteEditorModalProps) {
  const editorInstance = useRef<Editor | null>(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasUnsavedChanges = useRef(false)

  // Always-current refs so closures inside the editor event never go stale
  const titleRef = useRef(title)
  const noteRef = useRef(note)
  const reloadOnlyRef = useRef(reloadOnly)
  titleRef.current = title
  noteRef.current = note
  reloadOnlyRef.current = reloadOnly

  const isEditMode = !!note

  // Callback ref passed to the inner editor (always up-to-date)
  const onEditorChangeRef = useRef<() => void>(() => {})

  // Reset title whenever the modal opens with (possibly different) content
  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? '')
      hasUnsavedChanges.current = false
    }
  }, [open, note])

  const performUpdate = () => {
    const currentNote = noteRef.current
    if (!currentNote || !editorInstance.current) return
    const content = editorInstance.current.getMarkdown()
    router.patch(
      `/notes/${currentNote.id}`,
      { title: titleRef.current, content },
      { preserveScroll: true, only: reloadOnlyRef.current }
    )
    hasUnsavedChanges.current = false
  }

  const scheduleSave = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      if (hasUnsavedChanges.current) performUpdate()
    }, 2000)
  }

  // Keep the callback ref in sync with latest scheduleSave logic
  onEditorChangeRef.current = () => {
    if (noteRef.current) {
      hasUnsavedChanges.current = true
      scheduleSave()
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    if (isEditMode) {
      hasUnsavedChanges.current = true
      scheduleSave()
    }
  }

  const handleClose = () => {
    if (isEditMode && hasUnsavedChanges.current) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      performUpdate()
    }
    onClose()
  }

  const handleCreate = () => {
    if (!editorInstance.current || !selectedDate) return
    const content = editorInstance.current.getMarkdown()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    router.post(
      '/notes',
      { title: title.trim(), content, dueDate: toISODate(selectedDate) },
      {
        preserveScroll: true,
        only: reloadOnly,
        onSuccess: () => {
          setTitle('')
          onClose()
        },
        onFinish: () => setLoading(false),
      }
    )
  }

  const footer = isEditMode
    ? [
        <Button key="close" onClick={handleClose}>
          Fermer
        </Button>,
      ]
    : [
        <Button key="cancel" onClick={onClose}>
          Annuler
        </Button>,
        <Button key="create" type="primary" loading={loading} onClick={handleCreate}>
          Créer la note
        </Button>,
      ]

  return (
    <Modal
      title={isEditMode ? 'Modifier la note' : 'Créer une note'}
      open={open}
      onCancel={isEditMode ? handleClose : onClose}
      footer={footer}
      width={1100}
    >
      <Form layout="vertical">
        <Form.Item label="Titre" required style={{ marginBottom: 12 }}>
          <Input value={title} onChange={handleTitleChange} placeholder="Titre de la note" />
        </Form.Item>
      </Form>
      {/* Mounted only when open — guarantees the container div is in the DOM
          before the editor initialises, avoiding the Modal lazy-mount race. */}
      {open && (
        <ToastEditorInner
          initialContent={note?.content ?? ''}
          editorInstanceRef={editorInstance}
          onEditorChangeRef={onEditorChangeRef}
        />
      )}
    </Modal>
  )
}
