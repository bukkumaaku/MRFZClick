const MRFZ = {
	ReconitionInterface: function (capture, image, posibility) {
		let PointPosition = findImage(capture, image, {
			threshold: posibility,
		});
		if (!PointPosition) {
			return false;
		}
		return this.RandomPoint(PointPosition, image.getWidth(), image.getHeight(), image);
	},
	RandomPoint: function (PointPosition, width, height, image) {
		PointPosition = PointPosition.toString().match(/\d+\.\d+/g);
		PointPosition[0] = Number(PointPosition[0]);
		PointPosition[1] = Number(PointPosition[1]);
		image.recycle();
		return [
			width < 0 ? random(PointPosition[0] - width, PointPosition[0]) : random(PointPosition[0], PointPosition[0] + width),
			height < 0 ? random(PointPosition[1] - height, PointPosition[1]) : random(PointPosition[1], PointPosition[1] + height),
		];
	},
	GetButton: function (capture, ButtonName, SetThre) {
		let image = images.read("./res/" + ButtonName + ".png");
		return SetThre ? this.ReconitionInterface(capture, image, SetThre) : this.ReconitionInterface(capture, image, 0.7);
	},
	ClickButton: function (PointPosition) {
		click(PointPosition[0], PointPosition[1]);
	},
};
module.exports = MRFZ;
