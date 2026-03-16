// Komponenta pro prázdný stav - zobrazuje se když nejsou žádná data
function EmptyState({ icon = '📭', title, message, actionText, onAction }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        fontSize: '64px',
        marginBottom: '20px'
      }}>
        {icon}
      </div>
      <h3 style={{
        margin: '0 0 10px 0',
        color: '#333',
        fontSize: '20px'
      }}>
        {title}
      </h3>
      <p style={{
        margin: '0 0 30px 0',
        color: '#666',
        fontSize: '14px'
      }}>
        {message}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '12px 24px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;

