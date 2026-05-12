# IVY Community — Fashion Tech Platform

## Context
IVY (Investment for Ventured Youths) is a Nairobi-based fashion tech startup building a centralized marketplace for online fashion retailers in Kenya, with a virtual try-on system powered by AI and computer vision. Samuel joined as a developer (January 2025 – November 2025), working on multiple technical streams including the vendor management system, the measurement API, and the 3D modeling R&D.

The platform targets a real problem: Kenya's growing e-commerce market has high return rates for fashion purchases because customers cannot try clothes before buying. Instagram shops and boutiques have no virtual fitting room. IVY's solution is a centralized platform where any store can list inventory and customers can generate a 3D avatar of themselves to virtually try on clothes.

## The Wardrobe App / Fashion System

### What It Does
A multi-role Flutter application serving four user types:
- **Super User (IVY admin)**: manages all stores, verifies store accounts, views platform-wide data
- **Admin (Store Owner)**: manages their store's categories and products, handles orders and sales, manages attendants
- **Attendant**: processes sales and orders at the store level
- **Customer**: browses products, places orders, tracks delivery, and accesses the virtual try-on feature

### Technical Stack
- **Frontend**: Flutter (cross-platform, Android and iOS from one codebase)
- **Backend**: Django REST Framework (migrated from Firebase when 3D modeling requirements demanded server-side Python processing)
- **Database**: Firebase Firestore for real-time data (notifications, product listings, vendor sync), Django + PostgreSQL for core business logic and user management
- **Auth**: Django REST Framework JWT (migrated from Firebase Auth during the backend transition)
- **Admin**: Django admin panel used to manage store verification, data entry, and content moderation

### Why Django Over Firebase
The original architecture used Firebase for everything. When the 3D modeling requirement was confirmed, a server-side Python environment was needed to run OpenPose (computer vision) and SMPLX (3D mesh generation). At that point, migrating the business logic and auth to Django made sense — it gave a unified Python backend for both business logic and AI/CV processing.

## Measurement API — Computer Vision Pipeline

### The Problem
To generate a virtual try-on, you need accurate body measurements (shoulder width, waist circumference, height, hip width, etc.). Users cannot be trusted to self-report these accurately. The solution: extract measurements from photos.

### The Pipeline
1. **User uploads**: front-facing photo and side-facing photo via the Flutter app
2. **API request**: Django backend receives the images
3. **OpenPose processing**: OpenPose detects body keypoints from each photo — these are pixel coordinates for anatomical landmarks: left/right shoulder, left/right hip, left/right knee, neck, nose, left/right eye, etc. Typically 25 keypoints per image.
4. **Measurement calculation**: From keypoint pixel coordinates and a known reference (e.g. shoulder width in pixels vs. average shoulder width in cm), body measurements are derived mathematically — distance between keypoints, scaled to real-world dimensions
5. **Output**: Structured body measurements returned to the Flutter app as JSON

### Tools
- OpenPose (CMU's open-source pose estimation library)
- Pillow (Python image processing)
- Rembg (background removal before pose estimation — improves keypoint accuracy)
- OpenCV (image resizing, preprocessing before texture mapping)

## 3D Model R&D — SMPLX Integration

### Goal
Generate a 3D mesh of the user's body from the OpenPose keypoints, then render clothing on the 3D mesh for virtual try-on.

### What Was Tried
**Approach 1 (OpenPose keypoints → SMPLX model):** Feed the detected keypoints directly into SMPLX to generate a personalised 3D body mesh. This failed because SMPLX expects keypoints in a specific coordinate format and the mapping from OpenPose's output to SMPLX's input parameters produced distorted models — the body proportions were wrong.

**Approach 2 (Predefined SMPLX meshes + texture):** Use pre-defined SMPLX meshes as a baseline (average body shape) and apply a texture map derived from the user's photo onto the mesh. This was more stable but texture mapping produced mismatches — the user's image texture didn't align with the mesh's UV map because of pose differences between the photo and the predefined mesh.

**Outcome:** The 3D modeling feature was identified as requiring significantly more R&D time than the project timeline allowed. The decision was made to deploy the app with existing features (marketplace, inventory management, measurement API) while continuing 3D research for a future version. This was a pragmatic call — ship what works rather than delay everything for a complex experimental feature.

### Lessons
Working on the frontier of a technology with limited documentation is fundamentally different from building with established tools. OpenPose + SMPLX integration had almost no existing tutorials or examples for the exact use case. The work required reading research papers, reverse-engineering example code, and a lot of experimentation. The lesson: R&D timelines must be estimated with significantly more buffer than feature development timelines, and exit criteria ("what does good enough look like?") must be defined before starting.

## Duration & Role
- January 2025 – November 2025
- Role: Mobile & Backend Developer
- Responsibilities: Flutter app development across all modules, Django backend architecture and implementation, Measurement API design and development, 3D modeling R&D, Firebase → Django migration