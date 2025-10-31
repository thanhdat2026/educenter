import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../hooks/useDataContext';
import { SearchResult } from '../../types';
import { ICONS } from '../../constants';

export const GlobalSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { state } = useData();
    const navigate = useNavigate();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useMemo(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const foundResults: SearchResult[] = [];

        // Search Students
        state.students.forEach(s => {
            if (s.name.toLowerCase().includes(lowerQuery) || s.id.toLowerCase().includes(lowerQuery)) {
                foundResults.push({ id: s.id, name: s.name, type: 'student', path: `/student/${s.id}`, context: `Phụ huynh: ${s.parentName}` });
            }
        });

        // Search Teachers
        state.teachers.forEach(t => {
            if (t.name.toLowerCase().includes(lowerQuery) || t.subject.toLowerCase().includes(lowerQuery)) {
                foundResults.push({ id: t.id, name: t.name, type: 'teacher', path: `/teacher/${t.id}`, context: `Môn: ${t.subject}` });
            }
        });

        // Search Classes
        state.classes.forEach(c => {
            if (c.name.toLowerCase().includes(lowerQuery)) {
                // FIX: A class can have multiple teachers. Find all teacher names and join them.
                const teacherNames = c.teacherIds
                    .map(teacherId => state.teachers.find(t => t.id === teacherId)?.name)
                    .filter(name => !!name)
                    .join(', ');
                foundResults.push({ id: c.id, name: c.name, type: 'class', path: `/class/${c.id}`, context: `GV: ${teacherNames || 'N/A'}` });
            }
        });

        setResults(foundResults.slice(0, 10)); // Limit results
    }, [query, state.students, state.teachers, state.classes]);

    const handleResultClick = (path: string) => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        navigate(path);
    };

    return (
        <div className="relative w-full max-w-xs" ref={searchRef}>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    {ICONS.search}
                </span>
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Tìm kiếm học viên, lớp học..."
                    className="form-input w-full py-2 pl-10 pr-4"
                />
            </div>

            {isOpen && query.length > 1 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-md shadow-lg dark:bg-gray-800 border dark:border-gray-700 max-h-96 overflow-y-auto">
                    {results.length > 0 ? (
                        <ul>
                            {results.map(result => (
                                <li key={`${result.type}-${result.id}`}
                                    onClick={() => handleResultClick(result.path)}
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b dark:border-gray-700 last:border-b-0">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{result.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{result.context}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">Không tìm thấy kết quả.</div>
                    )}
                </div>
            )}
        </div>
    );
};