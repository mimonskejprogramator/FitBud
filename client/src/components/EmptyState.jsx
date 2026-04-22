import { Button } from "@/components/ui/button";

// Komponenta pro prázdný stav - zobrazuje se když nejsou žádná data
function EmptyState({ title, message, actionText, onAction }) {
  return (
    <div className="text-center py-16 px-5 bg-card text-card-foreground rounded-lg border shadow-sm">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{message}</p>
      {actionText && onAction && (
        <Button onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
}

export default EmptyState;

