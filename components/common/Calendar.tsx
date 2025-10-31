import React, { useState } from 'react';
import { ICONS } from '../../constants';
import { Link } from 'react-router-dom';

interface CalendarEvent {
    date: Date;
    title: string;
    link: string;
    color: string;
}

interface CalendarProps {
    events: CalendarEvent[];
}

const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const Calendar: React.FC<CalendarProps> = ({ events }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const changeMonth = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">{ICONS.chevronLeft}</button>
                <h2 className="text-xl font-bold">
                    {`Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`}
                </h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">{ICONS.chevronRight}</button>
            </div>
        );
    };

    const renderDays = () => {
        return (
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-gray-600 dark:text-gray-300">
                {dayNames.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDate = new Date(monthStart);
        startDate.setDate(startDate.getDate() - monthStart.getDay());
        const endDate = new Date(monthEnd);
        if (monthEnd.getDay() !== 6) {
             endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
        }

        const rows = [];
        let days = [];
        let day = new Date(startDate);
        const today = new Date();
        today.setHours(0,0,0,0);

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = new Date(day);
                const isCurrentMonth = cloneDay.getMonth() === currentDate.getMonth();
                const isToday = cloneDay.getTime() === today.getTime();

                const dayEvents = events.filter(e => {
                    const eventDate = new Date(e.date);
                    return eventDate.getFullYear() === cloneDay.getFullYear() &&
                           eventDate.getMonth() === cloneDay.getMonth() &&
                           eventDate.getDate() === cloneDay.getDate();
                });

                days.push(
                    <div key={day.toString()} className={`p-1 h-20 md:h-28 border border-gray-200 dark:border-gray-700 ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                        <div className={`text-sm font-semibold flex items-center justify-center ${isToday ? 'bg-primary text-white rounded-full w-6 h-6' : ''} ${isCurrentMonth ? '' : 'text-gray-400'}`}>
                            {cloneDay.getDate()}
                        </div>
                        <div className="mt-1 space-y-1 overflow-y-auto max-h-14 md:max-h-20">
                            {dayEvents.map((event, index) => (
                                <Link to={event.link} key={index} title={event.title} className="block text-xs p-0.5 md:p-1 rounded text-white truncate" style={{backgroundColor: event.color}}>
                                    {event.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                );
                day.setDate(day.getDate() + 1);
            }
            rows.push(<div key={day.toString()} className="grid grid-cols-7 gap-1">{days}</div>);
            days = [];
        }
        return <div>{rows}</div>;
    };


    return (
        <div className="card-base p-2 md:p-4">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
};