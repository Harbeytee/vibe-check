export default function CardFront({
  currentQuestion,
  canFlip,
}: {
  currentQuestion: string | null;
  canFlip: boolean;
}) {
  return (
    <div
      className="absolute inset-0 rounded-3xl bg-gradient-to-br from-card to-card/80 shadow-2xl flex flex-col items-center justify-center p-8 border border-border/50"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
      }}
    >
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <span className="text-2xl">❓</span>
        <span className="text-muted-foreground text-sm font-medium">
          Question
        </span>
        <span className="text-2xl">❓</span>
      </div>
      <p className="text-foreground font-display font-semibold text-xl md:text-2xl text-center leading-relaxed">
        {currentQuestion}
      </p>
      {canFlip && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <p className="text-muted-foreground text-sm">Answer honestly!</p>
        </div>
      )}
    </div>
  );
}
