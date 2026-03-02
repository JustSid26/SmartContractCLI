export default function Card({
                                 children,
                             }: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-[#1b1b22] border border-gray-800 rounded-xl p-8">
            {children}
        </div>
    );
}