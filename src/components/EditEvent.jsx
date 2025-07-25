import './AddEvent.css'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ref, push, set, onValue } from 'firebase/database';
import { editEventWithImage, realtimeDb } from '../config/firebase';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import SimpleMap from './SimpleMap';


const EditEvent = ({ showEditEvent, closeEditEvent, editData }) => {
    const [user, setUser] = useState(null);
    const [mapLocation, setMapLocation] = useState(null);
    const [eventData, setEventData] = useState({
        name: '',
        description: '',
        location: null,
        startDate: '',
        endDate: '',
        status: 'active'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleLocationChange = (newLocation) => {
        // This function is called by SimpleMap with the new location
        setEventData(prevData => ({
            ...prevData,
            location: newLocation
        }));
        setMapLocation(newLocation);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        //console.log(editData);
        setEventData(editData);
        setMapLocation(editData.location);
    }, [editData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };
    const previewImage = (e) => {
        if (e) {
            setImageFile(e);
            setImagePreview(URL.createObjectURL(e));
        }
    }
    const handleEditEvent = async () => {
        if (!eventData.name.trim() || !eventData.description.trim() || !eventData.startDate || !eventData.endDate || !eventData.location) {
            alert("Please fill in all fields and select a location.");
        }
        if (!user) {
            alert("Please sign in to edit event.");
            return;
        }
        const updatedEvent = {
            ...eventData,
            updatedBy: user.uid,
            updatedAt: new Date().toISOString(),
        }
        //const eventsRef = ref(realtimeDb, `events/${eventData.id}`);
        try {
            await editEventWithImage(eventData.id, updatedEvent, imageFile)
            alert("Edit Event Successfully!");
            closeEditEvent();
        } catch (e) {
            console.log(e);
            alert("Failed to Edit event. Please try again.");
        }
        /*
        const updatedEvent = {
            ...eventData,
            updatedBy: user.uid,
            updatedAt: new Date().toISOString(),
        }

        set(eventsRef, updatedEvent)
            .then(() => {
                alert("Event Edit successfully!");
                closeEditEvent(); 
            })
            .catch((error) => {
                console.error("Error Editing event:", error);
                alert("Failed to create event. Please try again.");
            });
        */

    }

    return (
        <div className="modal-wrapper">
            <form className="add-modal">
                <h1 className="modal-header">Edit Event</h1>
                <div className="input-group">
                    <label class="create-label" htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={eventData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label class="create-label" htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={eventData.description}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label class="create-label" htmlFor="startDate">Start Date</label>
                    <input
                        type="datetime-local"
                        id="startDate"
                        name="startDate"
                        value={eventData.startDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label class="create-label" htmlFor="endDate">End Date</label>
                    <input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        value={eventData.endDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="event-map-con">
                    <SimpleMap
                        location={mapLocation}
                        onLocationChange={handleLocationChange} // Pass the callback
                    />
                </div>
                <div className="input-image-group">
                    <label className="img-label" htmlFor="image">Change Event Image</label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={e => previewImage(e.target.files[0])}
                    />
                    {(imagePreview || eventData.imageUrl) && (
                        <div className="image-preview">
                            <img
                                className="event-img-preview"
                                src={imagePreview ? imagePreview : eventData.imageUrl}
                                alt="Preview"
                            />
                        </div>
                    )}

                </div>
                <div class="btn-group">
                    <button className="create-btn" type="button" onClick={handleEditEvent}>Edit</button>
                    <button className="cancel-btn" type="button" onClick={closeEditEvent}>Cancel</button>
                </div>
            </form>
        </div >
    );
};

export default EditEvent