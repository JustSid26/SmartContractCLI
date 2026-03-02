interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    fullWidth?: boolean;
}

export default function Button({
                                   children,
                                   onClick,
                                   disabled,
                                   fullWidth,
                               }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`bg-blue-600 hover:bg-blue-700 transition rounded-lg py-3 px-6 font-medium disabled:opacity-50 ${
                fullWidth ? "w-full" : ""
            }`}
        >
            {children}
        </button>
    );
}