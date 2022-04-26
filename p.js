let i1 = images.read("./7.png");
let i2 = images.grayscale(i1);
let i3 = images.threshold(i2, 125, 255, "BINARY");
let i4 = images.cvtColor(i3, "GRAY2BGRA");
images.save(i4,"./01.png");
i1.recycle();
i2.recycle();
i3.recycle();
i4.recycle();