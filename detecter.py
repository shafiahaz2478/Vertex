from ultralytics import YOLO


model = YOLO('best.pt')


results = model.predict(source='1.mp4', save=True, conf=0.5)


for r in results:
    print(r.boxes)