import { FiMinus, FiMaximize2, FiMinimize2, FiX } from 'react-icons/fi';
interface Props { onClose: () => void; onExpand: () => void; onMinimise: () => void; isExpanded: boolean }
export default function MacButtons({ onClose, onExpand, onMinimise, isExpanded }: Props) {
  const buttons = [
    { label: 'Close window', color: '#ff5f57', action: onClose, icon: <FiX /> },
    { label: 'Minimize window', color: '#febc2e', action: onMinimise, icon: <FiMinus /> },
    { label: isExpanded ? 'Restore window' : 'Maximize window', color: '#28c840', action: onExpand, icon: isExpanded ? <FiMinimize2 /> : <FiMaximize2 /> },
  ];
  return <div className="mac-buttons-flex" onPointerDown={e => e.stopPropagation()} onDoubleClick={e => e.stopPropagation()}>{buttons.map(b =>
    <button type="button" key={b.label} className="mac-button" style={{ backgroundColor: b.color }} aria-label={b.label} title={b.label} onClick={b.action}>{b.icon}</button>
  )}</div>;
}
