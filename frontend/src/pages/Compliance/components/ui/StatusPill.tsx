interface Props {
    status: string;
    type?: 'success' | 'warning' | 'danger' | 'info';
}

export default function StatusPill({ status, type = 'info' }: Props) {
    let classes = '';
    switch(type) {
        case 'success': classes = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'; break;
        case 'warning': classes = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'; break;
        case 'danger': classes = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'; break;
        default: classes = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'; break;
    }

    return (
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${classes}`}>
            {status}
        </span>
    );
}