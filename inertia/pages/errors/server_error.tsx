export default function ServerError(props: { error: any }) {
  return (
    <>
      <div className="container">
        <div className="title">Erreur serveur</div>

        <span>{props.error.message}</span>
      </div>
    </>
  )
}
