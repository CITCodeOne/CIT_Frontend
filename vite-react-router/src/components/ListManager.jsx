<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

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
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';

/**
 * ListManager Component - Reusable modal for adding items to user lists
 * 
 * Supports adding both individuals (actors/directors) and titles (movies/shows) to custom lists.
 * Users can select an existing list or create a new one.
 * 
 * @param {boolean} show - Controls modal visibility
 * @param {function} onHide - Called when modal should close
 * @param {string} itemName - Display name of the item being added
 * @param {string} itemId - ID of the item to add
 * @param {string} itemType - Type of item: 'individual' or 'title'
 * @param {string} userId - ID of the logged-in user
 * @param {function} onSuccess - Callback on successful addition (receives {action, listName, itemName})
 * @param {function} onError - Callback on error (receives error object)
 */
function ListManager({
    show,
    onHide,
    itemName,
    itemId,
    itemType,
    userId,
    onSuccess,
    onError
}) {
    const [lists, setLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState('');
    const [newListName, setNewListName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    // Fetch user's lists when modal opens
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    useEffect(() => {
        if (show && userId) {
            fetchUserLists();
        }
    }, [show, userId]);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
        if (!selectedList) return;

        setLoading(true);
        setError(null);

        try {
            if (selectedList === 'new') {
                // Create new list and add item
                if (!newListName.trim()) {
                    setError('Please enter a list name');
                    setLoading(false);
                    return;
                }

                // TODO: Replace with actual API calls
                // const newList = await mdb.apiv2.user.createList(userId, newListName);
                // await mdb.apiv2.user.addToList(userId, newList.id, itemId, itemType);
                
                console.log(`Creating new list "${newListName}" and adding ${itemType} ${itemId}`);
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    // Reset state when modal closes
    useEffect(() => {
        if (!show) {
            setSelectedListId('');
            setNewListName('');
            setError(null);
            setIsCreatingNew(false);
        }
    }, [show]);

    const fetchUserLists = async () => {
        try {
            setLoading(true);
            const dummyLists = [
                { id: 'list-1', name: 'Favorite Actors', itemCount: 12 },
                { id: 'list-2', name: 'Watch Later', itemCount: 8 },
                { id: 'list-3', name: 'Best Directors', itemCount: 5 }
            ];
            setLists(dummyLists);
        } catch (err) {
            console.error('Error fetching lists:', err);
            setError('Failed to load your lists');
            if (onError) onError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleListSelection = (e) => {
        const value = e.target.value;
        if (value === 'create-new') {
            setIsCreatingNew(true);
            setSelectedListId('');
        } else {
            setIsCreatingNew(false);
            setSelectedListId(value);
        }
    };

    const handleAddToList = async () => {
        try {
            setError(null);
            
            if (!isCreatingNew && !selectedListId) {
                setError('Please select a list');
                return;
            }
            if (isCreatingNew && !newListName.trim()) {
                setError('Please enter a list name');
                return;
            }
            if (isCreatingNew && newListName.length > 50) {
                setError('List name must be 50 characters or less');
                return;
            }

            setLoading(true);

            if (isCreatingNew) {
                console.log('Creating new list:', newListName);
                console.log('Adding item:', { itemId, itemName, itemType });
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                
                if (onSuccess) {
                    onSuccess({
                        action: 'created',
                        listName: newListName,
                        itemName: itemName
                    });
                }
            } else {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                // Add to existing list
                const list = userLists.find(l => l.id === selectedList);
                
                // TODO: Replace with actual API call
                // await mdb.apiv2.user.addToList(userId, selectedList, itemId, itemType);
                
                console.log(`Adding ${itemType} ${itemId} to list ${selectedList}`);
=======
                const selectedList = lists.find(l => l.id === selectedListId);
                console.log('Adding to existing list:', selectedList?.name);
                console.log('Adding item:', { itemId, itemName, itemType });
>>>>>>> Stashed changes
=======
                const selectedList = lists.find(l => l.id === selectedListId);
                console.log('Adding to existing list:', selectedList?.name);
                console.log('Adding item:', { itemId, itemName, itemType });
>>>>>>> Stashed changes
=======
                const selectedList = lists.find(l => l.id === selectedListId);
                console.log('Adding to existing list:', selectedList?.name);
                console.log('Adding item:', { itemId, itemName, itemType });
>>>>>>> Stashed changes
=======
                const selectedList = lists.find(l => l.id === selectedListId);
                console.log('Adding to existing list:', selectedList?.name);
                console.log('Adding item:', { itemId, itemName, itemType });
>>>>>>> Stashed changes
=======
                const selectedList = lists.find(l => l.id === selectedListId);
                console.log('Adding to existing list:', selectedList?.name);
                console.log('Adding item:', { itemId, itemName, itemType });
>>>>>>> Stashed changes
                
                if (onSuccess) {
                    onSuccess({
                        action: 'added',
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                        listName: list?.name || 'Unknown List',
=======
                        listName: selectedList?.name || 'Unknown List',
>>>>>>> Stashed changes
=======
                        listName: selectedList?.name || 'Unknown List',
>>>>>>> Stashed changes
=======
                        listName: selectedList?.name || 'Unknown List',
>>>>>>> Stashed changes
=======
                        listName: selectedList?.name || 'Unknown List',
>>>>>>> Stashed changes
=======
                        listName: selectedList?.name || 'Unknown List',
>>>>>>> Stashed changes
                        itemName: itemName
                    });
                }
            }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
            // Reset and close
            handleClose();
        } catch (err) {
            console.error('Error adding to list:', err);
            setError('Failed to add to list. Please try again.');
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            onHide();
        } catch (err) {
            console.error('Error adding to list:', err);
            setError('Failed to add item to list');
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            if (onError) onError(err);
        } finally {
            setLoading(false);
        }
    };

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Add {itemName || 'Item'} to List
                </Modal.Title>
            </Modal.Header>

=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    const getPlaceholder = () => {
        if (itemType === 'individual') {
            return 'e.g., Favorite Actors, Directors to Watch';
        }
        return 'e.g., Watch Later, Favorites';
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add to List</Modal.Title>
            </Modal.Header>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            <Modal.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {loadingLists ? 'Loading your lists...' : 'Select a list:'}
                        </Form.Label>
                        <Form.Select 
                            value={selectedList} 
                            onChange={(e) => setSelectedList(e.target.value)}
                            disabled={loadingLists || loading}
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
                                placeholder={
                                    itemType === 'individual' 
                                        ? 'e.g., Favorite Actors' 
                                        : 'e.g., Must Watch Movies'
                                }
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                disabled={loading}
                                autoFocus
                                maxLength={50}
                            />
                            <Form.Text className="text-muted">
                                Max 50 characters
                            </Form.Text>
                        </Form.Group>
                    )}
                </Form>

                {selectedList && selectedList !== 'new' && (
                    <div className="text-muted small">
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
                    disabled={!isFormValid() || loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                <p className="text-muted mb-3">
                    Add <strong>{itemName}</strong> to a list
                </p>

                {loading && lists.length === 0 ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" size="sm" />
                        <p className="mt-2 text-muted">Loading your lists...</p>
                    </div>
                ) : (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Select List</Form.Label>
                            <Form.Select
                                value={isCreatingNew ? 'create-new' : selectedListId}
                                onChange={handleListSelection}
                                disabled={loading}
                            >
                                <option value="">Choose a list...</option>
                                {lists.map(list => (
                                    <option key={list.id} value={list.id}>
                                        {list.name} ({list.itemCount} items)
                                    </option>
                                ))}
                                <option value="create-new">+ Create New List</option>
                            </Form.Select>
                        </Form.Group>

                        {isCreatingNew && (
                            <Form.Group className="mb-3">
                                <Form.Label>New List Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={getPlaceholder()}
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    maxLength={50}
                                    disabled={loading}
                                    autoFocus
                                />
                                <Form.Text className="text-muted">
                                    {newListName.length}/50 characters
                                </Form.Text>
                            </Form.Group>
                        )}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleAddToList}
                    disabled={loading || (!isCreatingNew && !selectedListId) || (isCreatingNew && !newListName.trim())}
                >
                    {loading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
