import React from 'react';
import mdb from '../business-logic-layer/ApiClient/ApiClient';

function TestHealth() {
        const [status, setStatus] = React.useState('Checking service status...');
        const [error, setError] = React.useState(null);

        React.useEffect(() => {
                const abortController = new AbortController();
                let cancelled = false;

                async function fetchHealth() {
                        try {
                                const response = await mdb.apiv2.health.status({ signal: abortController.signal });
                                if (!cancelled) {
                                        setStatus(typeof response === 'string' ? response : JSON.stringify(response));
                                }
                        } catch (err) {
                                if (!cancelled) {
                                        setError(err instanceof Error ? err.message : 'Unknown error');
                                }
                        }
                }

                fetchHealth();

                return () => {
                        cancelled = true;
                        abortController.abort();
                };
        }, []);

        if (error) {
                return (
                        <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>
                                <h2>Health Check Failed</h2>
                                <p>{error}</p>
                        </div>
                );
        }

        return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h2>Health Check</h2>
                        <p>{status}</p>
                </div>
        );
}

export default TestHealth;
