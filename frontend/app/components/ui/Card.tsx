export default function Card({
    children,
    title,
}: {
    children: React.ReactNode;
    title?: string;
}) {
    return (
        <div
            style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                padding: "28px",
            }}
        >
            {title && (
                <p
                    style={{
                        fontSize: "11.5px",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: "20px",
                    }}
                >
                    {title}
                </p>
            )}
            {children}
        </div>
    );
}