import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebase';
import { ChevronLeft, Camera, MessageSquare, Save, Edit } from 'lucide-react';

// Rest of ApartmentInspectionPage.tsx content remains the same, just update the firebase import path