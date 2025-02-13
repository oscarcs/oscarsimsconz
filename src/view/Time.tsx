import { useEffect, useState } from "react";

export function Time() {
    const [time, setTime] = useState('');
    
    useEffect(() => {
        const updateTime = () => {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Europe/Tallinn',
                hour: '2-digit',
                minute: '2-digit',
            });
            setTime(formatter.format(new Date()));
        };

        updateTime();
        const interval = setInterval(updateTime, 10000);
        return () => clearInterval(interval);
    }, []);

    return <>{time}</>;
}