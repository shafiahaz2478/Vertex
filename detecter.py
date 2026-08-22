import cv2
from ultralytics import YOLO

# 1. Load your pothole model
model = YOLO('best.pt')

# 2. Connect to the phone stream URL
stream_url = 'http://10.12.243.213:8080/video'  # Replace with your phone's IP
cap = cv2.VideoCapture(stream_url)

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        break

    # 3. Run YOLO inference on the stream frame
    # stream=True optimizes memory for video feeds
    results = model(frame, conf=0.45, stream=True)

    # 4. Draw bounding boxes
    for r in results:
        annotated_frame = r.plot()

    # 5. Display the live feed with bounding boxes
    cv2.imshow('Live Dashcam Pothole Detector', annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()