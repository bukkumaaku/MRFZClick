var rec = function() {
    threads.start(function() {
        let dir = "./res/label/";
        let labels = files.listDir(dir);
        let cap = captureScreen();

        toast("开始计算公招");
        sleep(100);

        let MRFZ = require("./MRFZ.js"),
            top = images.read("./res/recruit/top.png"),
            right = images.read("./res/recruit/right.png"),
            bottom = images.read("./res/recruit/bottom.png"),
            left = images.read("./res/recruit/left.png");

        let test = MRFZ.ReconitionInterface(cap, top, false, true);
        if (!test) {
            toast("不在公招界面");
            top.recycle();
            left.recycle();
            bottom.recycle();
            right.recycle();
            return;
        }

        let top_boundary = test[0].y + test[2];
        let right_boundary = MRFZ.ReconitionInterface(
            cap,
            right,
            false,
            true
        )[0].x;
        let bottom_boundary = MRFZ.ReconitionInterface(
            cap,
            bottom,
            false,
            true
        )[0].y;
        let test2 = MRFZ.ReconitionInterface(cap, left, false, true);
        let left_boundary = test2[0].x + test2[2];

        top.recycle();
        left.recycle();
        bottom.recycle();
        right.recycle();

        let t = [];
        for (let i = 0; i < labels.length; i++) {
            if (labels[i] == ".nomedia") continue;
            let image = images.read(dir + labels[i]);
            MRFZ.ScaleNum = MRFZ.ScaleSet(MRFZ.ScreenLandscape());
            let img = images.scale(image, MRFZ.ScaleNum, MRFZ.ScaleNum);
            image.recycle();
            if (
                findImage(cap, img, {
                    region: [
                        left_boundary,
                        top_boundary,
                        right_boundary - left_boundary,
                        bottom_boundary - top_boundary,
                    ],
                    threshold: 0.85,
                })
            ) {
                t.push(labels[i].replace(".png", ""));
            }
            img.recycle();
            if (t.length >= 5) break;
        }
        let result = t.length == 5 ? require("./getLabel.js").get_r(t) : [];
        let str = "";
        for (let i = 0; i < result.length; i++) {
            str += result[i].name + ":" + result[i].add_tags.join("，") + "\n";
        }
        str = str ? str : "随便选吧反正没有四星及以上";
        alert("公招结果", t + "\n" + str);
    });
};
module.exports = rec;