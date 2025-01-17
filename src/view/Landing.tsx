'use client';

type AppProps = {
    children: React.ReactNode,
    message: string,
};

export default function Landing({ children, message, ...props }: AppProps) {
    return <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-100 to-blue-100" {...props}>
        <div className="p-8 bg-white rounded-lg shadow-md">
            <h1>This site is currently under construction.</h1>
        </div>
    </div>;
}