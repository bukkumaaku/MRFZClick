var MRFZ = {
    image: null,
    capture: null,
    ScaleNum: 0,
    ReconitionInterface: function (capture, image1, posibility, rand) {
        posibility = posibility ? posibility : 0.9;
        let setting = JSON.parse(
            files.read("./lib/setting.json", (encoding = "utf-8"))
        );
        this.ScaleNum = setting.SplitScreen
            ? this.ScaleSet(this.ScreenLandscape())
            : this.ScaleSet(2);
        var image = images.scale(image1, this.ScaleNum, this.ScaleNum);
        image1.recycle();
        let PointPosition = images.findImage(capture, image, {
            threshold: posibility,
        });
        let img_height = image.getHeight(),
            img_width = image.getWidth();
        image.recycle();
        if (!PointPosition) {
            return false;
        }
        return rand
            ? [PointPosition, img_width, img_height]
            : [
                  img_width < 0
                      ? random(PointPosition.x - img_width, PointPosition.x)
                      : random(PointPosition.x, PointPosition.x + img_width),
                  img_height < 0
                      ? random(PointPosition.y - img_height, PointPosition.y)
                      : random(PointPosition.y, PointPosition.y + img_height),
              ];
    },
    GetButton: function (capture, ButtonName, SetThre) {
        var image = images.read("./res/" + ButtonName + ".png");
        return SetThre
            ? this.ReconitionInterface(capture, image, SetThre)
            : this.ReconitionInterface(capture, image, 0.7);
    },
    ClickButton: function (PointPosition) {
        log(PointPosition);
        click(PointPosition[0], PointPosition[1]);
    },
    GetMaterial: function (capture, MaterialName, SetThre) {
        if (!MaterialName) {
            capture.recycle();
            return false;
        }
        var image1 = images.read("./res/material/" + MaterialName + ".png");
        var image2 = images.grayscale(image1);
        var image3 = images.threshold(image2, 125, 255, "BINARY");
        this.capture = images.copy(capture);
        var image4 = images.cvtColor(image3, "GRAY2BGRA");
        this.image = images.scale(image4, this.ScaleNum, this.ScaleNum);
        image1.recycle();
        image2.recycle();
        image3.recycle();
        image4.recycle();
        return SetThre
            ? this.ReconitionMaterial(SetThre)
            : this.ReconitionMaterial(0.9);
    },
    ReconitionMaterial: function (posibility) {
        let MaterialCount = images.matchTemplate(this.capture, this.image, {
            threshold: posibility,
            max: 2,
        });
        if (MaterialCount.matches.length == 0) this.capture.recycle();
        log(MaterialCount);
        return MaterialCount;
    },
    CheckNumber: function (point) {
        let imageWidth = this.image.getWidth();
        let imageHeight = this.image.getHeight();
        let max = 0,
            num = 0;
        for (let i = 1; i <= 7; i++) {
            if (!files.exists("./res/number/" + i + ".png")) {
                continue;
            }
            let NumberPic = images.read("./res/number/" + i + ".png");
            let result = images.matchTemplate(this.capture, NumberPic, {
                region: [point.x, point.y, imageWidth, imageHeight],
                threshold: 0.7,
                max: 1,
            });
            NumberPic.recycle();
            if (result.matches.length && max < result.matches[0].similarity) {
                max = result.matches[0].similarity;
                num = i;
            }
        }
        if(!num) {
            num = 1;
            log("未识别到数字");
        }
        return num;
    },
    ScreenLandscape: function () {
        let config = context.getResources().getConfiguration();
        let ori = config.orientation;
        if (ori == config.ORIENTATION_LANDSCAPE) {
            return 2;
        } else if (ori == config.ORIENTATION_PORTRAIT) {
            return 1;
        }
    },
    ScaleSet: function (SplitScreen) {
        //判断游戏缩放比例
        let DeviceHeight = device.height,
            DeviceWidth = device.width,
            DefaultWidth = 1080,
            DefaultHeight = 1920;
        let DefaultDelta = DefaultHeight / DefaultWidth,
            DeviceDelta = DeviceHeight / DeviceWidth;
        if (SplitScreen == 2) {
            if (DefaultDelta < DeviceDelta) {
                return DeviceWidth / DefaultWidth;
            } else {
                return DeviceHeight / DefaultHeight;
            }
        } else {
            return DeviceWidth / DefaultHeight;
        }
    },
};
module.exports = MRFZ;
