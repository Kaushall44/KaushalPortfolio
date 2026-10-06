import MacButtons from "../Home/MacButtons";
import { useTerminalStore } from "../../store/terminalStore";

interface TerminalHeaderProps {
  onClose?: () => void;
  onExpand?: () => void;
  onMinimise?: () => void;
  isExpanded?: boolean;
}

function TerminalHeader({ onClose, onExpand, onMinimise, isExpanded }: TerminalHeaderProps) {
  const { currentDirectory } = useTerminalStore();

  return (
    <div className="terminal-header">
      <MacButtons
        onClose={onClose || (() => {})}
        onExpand={onExpand || (() => {})}
        onMinimise={onMinimise || (() => {})}
        isExpanded={isExpanded || false}
      />
      <span className="terminal-title">kaushal@portfolio:{currentDirectory}</span>
    </div>
  );
}

export default TerminalHeader;
