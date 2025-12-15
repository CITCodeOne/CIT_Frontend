import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';

/**
 * ListManager Component
 * 
 * Reusable modal component for managing user lists (create, add items to lists)
 * Can be used for adding titles, individuals, or any other items to user lists
 * 
 * @param {boolean} show - Whether the modal is visible
 * @param {function} onHide - Callback when modal is closed
 * @param {string} itemName - Name of the item being added (e.g., "Tom Cruise", "The Shawshank Redemption")
 * @param {string} itemId - ID of the item being added
 * @param {string} itemType - Type of item: 'individual' or 'title'
 * @param {string} userId - ID of the logged-in user
 * @param {function} onSuccess - Callback when item is successfully added to list
 * @param {function} onError - Callback when an error occurs
 */
function ListManager({ 
    show, 
    onHide, 
    itemName, 
    itemId, 
    itemType = 'individual',
    userId,
    onSuccess,
    onError 
}) {
    const [selectedList, setSelectedList] = useState('');
    const [newListName, setNewListName] = useState('');
    const [userLists, setUserLists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingLists, setLoadingLists] = useState(false);
    const [error, setError] = useState(null);

    // Load user lists when modal opens
    useEffect(() => {
        if (show && userId) {
            fetchUserLists();
        }
    }, [show, userId]);

    // Reset state when modal closes
    useEffect(() => {
        if (!show) {
            setSelectedList('');
            setNewListName('');
            setError(null);
        }
    }, [show]);

    // Fetch user's lists from API
    const fetchUserLists = async () => {
        setLoadingLists(true);
        setError(null);
        
        try {
            // TODO: Replace with actual API call
            // const lists = await mdb.apiv2.user.getLists(userId);
            
            // Dummy data for now
            const dummyLists = [
                { id: '1', name: 'Favorite Actors', itemCount: 5 },
                { id: '2', name: 'Directors to Watch', itemCount: 3 },
                { id: '3', name: 'My Inspiration', itemCount: 8 }
            ];
            
            setUserLists(dummyLists);
        } catch (err) {
            console.error('Error fetching user lists:', err);
            setError('Failed to load your lists. Please try again.');
            if (onError) onError(err);
        } finally {
            setLoadingLists(false);
        }
    };

    // Handle adding item to selected list
    const handleAddToList = async () => {
        if (!selectedList) {
            setError('Please select a list');
            return;
        }

        if (selectedList === 'new' && !newListName.trim()) {
            setError('Please enter a list name');
            return;
        }

        if (selectedList === 'new' && newListName.length > 50) {
            setError('List name must be 50 characters or less');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (selectedList === 'new') {
                // Create new list and add item
                // TODO: Replace with actual API calls
                // const newList = await mdb.apiv2.user.createList(userId, newListName);
                // await mdb.apiv2.user.addToList(userId, newList.id, itemId, itemType);
                
                console.log(`Creating new list "${newListName}" and adding ${itemType} ${itemId}`);
                
                if (onSuccess) {
                    onSuccess({
                        action: 'created',
                        listName: newListName,
                        itemName: itemName
                    });
                }
            } else {
                // Add to existing list
                const list = userLists.find(l => l.id === selectedList);
                
                // TODO: Replace with actual API call
                // await mdb.apiv2.user.addToList(userId, selectedList, itemId, itemType);
                
                console.log(`Adding ${itemType} ${itemId} to list ${selectedList}`);
                
                if (onSuccess) {
                    onSuccess({
                        action: 'added',
                        listName: list?.name || 'Unknown List',
                        itemName: itemName
                    });
                }
            }

            // Reset and close
            handleClose();
        } catch (err) {
            console.error('Error adding to list:', err);
            setError('Failed to add to list. Please try again.');
            if (onError) onError(err);
        } finally {
            setLoading(false);
        }
    };

    // Reset state and close modal
    const handleClose = () => {
        setSelectedList('');
        setNewListName('');
        setError(null);
        onHide();
    };

    // Check if form is valid
    const isFormValid = () => {
        if (!selectedList) return false;
        if (selectedList === 'new' && !newListName.trim()) return false;
        return true;
    };

    // Get placeholder text based on item type
    const getPlaceholder = () => {
        if (itemType === 'individual') {
            return 'e.g., Favorite Actors, Directors to Watch';
        }
        return 'e.g., Must Watch Movies, Favorites';
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Add {itemName || 'Item'} to List
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {loadingLists ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" size="sm" />
                        <p className="mt-2 text-muted">Loading your lists...</p>
                    </div>
                ) : (
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Select a list:
                            </Form.Label>
                            <Form.Select 
                                value={selectedList} 
                                onChange={(e) => setSelectedList(e.target.value)}
                                disabled={loading}
                            >
                                <option value="">-- Choose a list --</option>
                                {userLists.map(list => (
                                    <option key={list.id} value={list.id}>
                                        {list.name} ({list.itemCount} items)
                                    </option>
                                ))}
                                <option value="new">+ Create New List</option>
                            </Form.Select>
                        </Form.Group>

                        {selectedList === 'new' && (
                            <Form.Group className="mb-3">
                                <Form.Label>New List Name:</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={getPlaceholder()}
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    disabled={loading}
                                    autoFocus
                                    maxLength={50}
                                />
                                <Form.Text className="text-muted">
                                    {newListName.length}/50 characters
                                </Form.Text>
                            </Form.Group>
                        )}
                    </Form>
                )}

                {selectedList && selectedList !== 'new' && (
                    <div className="text-muted small mt-2">
                        <strong>Note:</strong> {itemName} will be added to "
                        {userLists.find(l => l.id === selectedList)?.name}"
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button 
                    variant="secondary" 
                    onClick={handleClose}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleAddToList}
                    disabled={!isFormValid() || loading || loadingLists}
                >
                    {loading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Adding...
                        </>
                    ) : (
                        'Add to List'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ListManager;
