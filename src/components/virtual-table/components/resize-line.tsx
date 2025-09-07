function ResizeLine() {
  return (
    <div
      id='resize-line'
      style={{
        position: 'fixed',
        top: 0,
        width: '4px',
        height: '100vh',
        background: '#dbeafe',
        display: 'none',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    />
  );
}

export default ResizeLine;
