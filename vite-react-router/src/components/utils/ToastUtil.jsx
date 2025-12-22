import { useEffect } from 'react';
import { Button } from 'react-bootstrap';

/**
 * ToastConfirm
 * - If `onConfirm` is provided, renders a confirm bar with Cancel/Confirm buttons.
 * - Otherwise, renders a simple toast message that auto-hides after `autoHide` ms.
 *
 * Props:
 * - show: boolean
 * - message: string
 * - onClose: () => void
 * - onConfirm?: () => void
 * - onCancel?: () => void
 * - autoHide?: number (ms)
 */
export default function ToastConfirm({ show, message, onClose, onConfirm, onCancel, autoHide = 2500 }) {
    useEffect(() => {
        if (!show) return;
        if (!onConfirm && autoHide > 0) {
            const t = setTimeout(() => {
                onClose && onClose();
            }, autoHide);
            return () => clearTimeout(t);
        }
    }, [show, onConfirm, autoHide, onClose]);

    if (!show) return null;

    const containerStyle = {
        zIndex: 1080,
        marginBottom: '2rem',
    };

    if (onConfirm) {
        return (
            <div className="position-fixed bottom-0 start-50 translate-middle-x bg-dark text-light px-3 py-2 rounded-3 shadow d-flex align-items-center" style={containerStyle}>
                <div>{message}</div>
                <div className="ms-auto d-flex gap-2">
                    <Button variant="light" size="sm" onClick={() => { onCancel && onCancel(); onClose && onClose(); }}>Cancel</Button>
                    <Button variant="danger" size="sm" onClick={() => { onConfirm && onConfirm(); onClose && onClose(); }}>Confirm</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="position-fixed bottom-0 start-50 translate-middle-x bg-dark text-light px-4 py-3 rounded-3 shadow" style={containerStyle}>
            {message}
        </div>
    );
}
