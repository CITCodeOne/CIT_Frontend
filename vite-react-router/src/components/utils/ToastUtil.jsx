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
        // Saa snart toasten vises uden confirm-knapper, start automatisk nedtaelling til at skjule den igen
        if (!show) return;
        if (!onConfirm && autoHide > 0) {
            const t = setTimeout(() => {
                onClose && onClose();
            }, autoHide);
            return () => clearTimeout(t);
        }
    }, [show, onConfirm, autoHide, onClose]);

    // Hvis show er false, rendrer vi ingenting; holder DOM ren
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
                    {/* Cancel lukker toast og kalder frivillig onCancel hvis givet */}
                    <Button variant="light" size="sm" onClick={() => { onCancel && onCancel(); onClose && onClose(); }}>Cancel</Button>
                    {/* Confirm goer det samme men kalder onConfirm for at godkende handlingen */}
                    <Button variant="danger" size="sm" onClick={() => { onConfirm && onConfirm(); onClose && onClose(); }}>Confirm</Button>
                </div>
            </div>
        );
    }

    // Simpel auto-hide toast uden knapper, placeret nederst centreret
    return (
        <div className="position-fixed bottom-0 start-50 translate-middle-x bg-dark text-light px-4 py-3 rounded-3 shadow" style={containerStyle}>
            {message}
        </div>
    );
}
