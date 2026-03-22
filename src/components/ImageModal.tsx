/**
 * Componente ImageModal - Modal para ver imagen en grande
 * Se abre al hacer click en la miniatura de un item
 */

interface ImageModalProps {
  imagen: string | null;
  onClose: () => void;
}

export function ImageModal({ imagen, onClose }: ImageModalProps) {
  if (!imagen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img 
        src={imagen} 
        alt="Imagen del producto" 
        className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
