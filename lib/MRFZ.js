importClass();
var MRFZ = {
	image: null,
	capture: null,
	ScaleNum: 0,
	ReconitionInterface: function (capture, image, posibility) {
		this.ScaleNum = this.ScaleSet(this.ScreenLandscape());
		image = images.scale(image, this.ScaleNum, this.ScaleNum);
		let PointPosition = findImage(capture, image, {
			threshold: posibility,
		});
		if (!PointPosition) {
			return false;
		}
		return this.RandomPoint(
			PointPosition,
			image.getWidth(),
			image.getHeight(),
			image
		);
	},
	RandomPoint: function (PointPosition, width, height, image) {
		PointPosition = PointPosition.toString().match(/\d+\.\d+/g);
		PointPosition[0] = Number(PointPosition[0]);
		PointPosition[1] = Number(PointPosition[1]);
		image.recycle();
		return [
			width < 0
				? random(PointPosition[0] - width, PointPosition[0])
				: random(PointPosition[0], PointPosition[0] + width),
			height < 0
				? random(PointPosition[1] - height, PointPosition[1])
				: random(PointPosition[1], PointPosition[1] + height),
		];
	},
	GetButton: function (capture, ButtonName, SetThre) {
		let image = images.read("./res/" + ButtonName + ".png");
		return SetThre
			? this.ReconitionInterface(capture, image, SetThre)
			: this.ReconitionInterface(capture, image, 0.7);
	},
	ClickButton: function (PointPosition) {
		click(PointPosition[0], PointPosition[1]);
	},
	GetMaterial: function (capture, MaterialName, SetThre) {
		if (!MaterialName) return false;
		this.image = images.read("./res/material/" + MaterialName + ".png");
		this.image = images.grayscale(this.image);
		this.image = images.threshold(this.image, 130, 255, "BINARY");
		this.capture = capture;
		this.image = images.cvtColor(this.image, "GRAY2BGRA");
		this.image = images.scale(this.image, this.ScaleNum, this.ScaleNum);
		return SetThre
			? this.ReconitionMaterial(SetThre)
			: this.ReconitionMaterial(0.8);
	},
	ReconitionMaterial: function (posibility) {
		let MaterialCount = images.matchTemplate(this.capture, this.image, {
			threshold: posibility,
			max: 2,
		});
		log(MaterialCount);
		return MaterialCount;
	},
	CheckNumber: function (point) {
		let imageWidth = this.image.getWidth();
		let imageHeight = this.image.getHeight();
		let max = 0,
			num = 1;
		for (let i = 1; i <= 5; i++) {
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
		this.image.recycle();
		return num;
	},
	RecycleCapture: function () {
		this.capture.recycle();
	},
	ScreenLandscape: function () {
		let config = context.getResources().getConfiguration();
		let ori = config.orientation;
		if (ori == config.ORIENTATION_LANDSCAPE) {
			//横屏
			return true;
		} else if (ori == config.ORIENTATION_PORTRAIT) {
			//竖屏
			return false;
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
