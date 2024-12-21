'use client';

type AppProps = {
    children: React.ReactNode,
    message: string,
};

export default function Hello({ children, message, ...props }: AppProps) {
    return <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-rose-100 to-teal-100" {...props}>
        <h1>Hello, world: {message}</h1>
    </div>;
}