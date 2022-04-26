/***
 * @param type show_message, stop_signal, set_title
 */

const _sleep = sleep,
    _toastLog = toastLog,
    SendM = (e) => {
        ThreadCommunicate.emit("tofloaty", e);
    };

sleep = (e) => {
    _sleep(e + Math.pow(10, e.toString().length - 1));
};
toastLog = (e) => {
    _toastLog(e);
    SendM({ type: "show_message", message: e });
};

var setting = JSON.parse(
        files.read("./lib/setting.json", (encoding = "utf-8"))
    ),
    MRFZ = require("./MRFZ.js"),
    storage = storages.create("MRFZClickMaterialList"),
    MaterialList = JSON.parse(storage.get("list")),
    isCountBattleNumber = true,
    speed = setting.TwoSpeed ? 2 : 1,
    isStart = true;

MRFZ.ScaleNum = ScaleSet();
_sleep(500);
requestScreenCapture();

toastLog("请启动明日方舟");

var result,
    result2,
    capture,
    UseOriginiumsCount = 0,
    Action = true,
    CountBattleNumber = 1,
    SleepTime = 2000;

ThreadCommunicate.on("to_click", (e) => {
    isStart = e;
});
function startClick() {
    var StopProcess = (e) => {
        UseOriginiumsCount = 0;
        CountBattleNumber = 1;
        isStart = true;
        if (e) toastLog(e);
        SendM({ type: "stop_signal", message: true });
        SendM({ type: "set_title", message: "结束行动" });
    };

    while (Action) {
        $debug.gc();

        sleep(SleepTime / speed);

        if (capture) capture.recycle();
        if (isStart) {
            continue;
        }

        capture = captureScreen();
        result = MRFZ.GetButton(capture, "BlueActionButton");
        result2 = MRFZ.GetButton(capture, "BlueActionButtonWithSan");

        let result3 = MRFZ.GetButton(capture, "dbs");
        if (result || result2 || result3) {
            toastLog("点击 蓝·开始行动");
            SendM({
                type: "set_title",
                message: "第" + CountBattleNumber + "轮行动",
            });
            MRFZ.ClickButton(result ? result : result2 ? result2 : result3);
            SleepTime = 3000;
            continue;
        }

        result = MRFZ.GetButton(capture, "RedActionButton");

        if (result) {
            toastLog("点击 红·开始行动");
            if (isCountBattleNumber) {
                CountBattleNumber++;
            }
            isCountBattleNumber = false;
            MRFZ.ClickButton(result);
            SendM({ type: "count", message: CountBattleNumber - 1 });
            SleepTime = 6000;
            continue;
        }

        result = MRFZ.GetButton(capture, "InBattle");

        if (result) {
            continue;
        }

        result = MRFZ.GetButton(capture, "EndInterface");
        result1 = MRFZ.GetButton(capture, "EndExterminateInterface");

        if (result || result1) {
            sleep(3000);
            MRFZ.ClickButton(result ? result : result1);
            toastLog("结束第" + Number(CountBattleNumber - 1) + "轮");
            isCountBattleNumber = true;
            SleepTime = 5000;
            if (capture) capture.recycle();
            let capturez = captureScreen();
            if (
                (setting.isRecycle &&
                    CountBattleNumber > Number(setting.recycles)) ||
                CountMaterial(capturez)
            ) {
                StopProcess(
                    "已完成目标设定次数，使用了" + UseOriginiumsCount + "颗源石"
                );
            }
            continue;
        }

        result = MRFZ.GetButton(capture, "UseSanMedician");
        result2 = MRFZ.GetButton(capture, "UseSanMedicianButton");

        if (result && result2 && setting.UseSanMedician) {
            MRFZ.ClickButton(result2);
            toastLog("饮用理智药剂");
            continue;
        } else if (result && !setting.UseSanMedician) {
            StopProcess("已消耗完理智");
            continue;
        }

        result = MRFZ.GetButton(capture, "UseOriginiums");
        result2 = MRFZ.GetButton(capture, "UseOriginiumsButton");

        if (
            result &&
            result2 &&
            setting.UseOriginiums &&
            UseOriginiumsCount < Number(setting.UseOriginiumsNumber)
        ) {
            MRFZ.ClickButton(result2);
            UseOriginiumsCount++;
            toastLog("使用第" + UseOriginiumsCount + "源石恢复全部理智");
            SendM({ type: "count_originiums", message: UseOriginiumsCount });
            continue;
        } else if (
            (result &&
                result2 &&
                ((setting.UseOriginiums &&
                    UseOriginiumsCount >=
                        Number(setting.UseOriginiumsNumber)) ||
                    !setting.UseOriginiums)) ||
            (result && !result2)
        ) {
            StopProcess("已消耗" + UseOriginiumsCount + "颗源石和全部理智");
            continue;
        }

        result = MRFZ.GetButton(capture, "PRTSMistake");
        if (result && setting.ContinueAction) {
            result = MRFZ.GetButton(capture, "ContinueAction");
            MRFZ.ClickButton(result);
        } else if (result && !setting.ContinueAction) {
            result = MRFZ.GetButton(capture, "GiveUpAction");
            MRFZ.ClickButton(result);
            CountBattleNumber--;
        }
        result = MRFZ.GetButton(capture, "ActionFault");

        if (result) {
            toastLog("任务失败");
            MRFZ.ClickButton(result);
            continue;
        }

        result = MRFZ.GetButton(capture, "EndExterminate");

        if (result) {
            toastLog("剿灭结束");
            MRFZ.ClickButton(result);
            continue;
        }

        result = MRFZ.GetButton(capture, "LevelUp");

        if (result) {
            toastLog("等级提升");
            MRFZ.ClickButton(result);
            continue;
        }
    }
}

function CountMaterial(capture) {
    if (!setting.CountMaterial || MaterialList.number.length < 1) {
        capture.recycle();
        return false;
    }
    let complete = true;
    capture1 = images.grayscale(capture);
    capture2 = images.threshold(capture1, 125, 255, "BINARY");
    capture3 = images.cvtColor(capture2, "GRAY2BGRA");
    //遍历已添加的材料
    for (let i = 0; i < MaterialList.name.length; i++) {
        //获取返回结果
        var result = MRFZ.GetMaterial(
            capture3,
            MaterialList.name[i],
            MaterialListC[MaterialList.name[i]]
        );
        if (result && result.matches) {
            //查看返回结果数量
            for (let j = 0; j < result.points.length; j++) {
                MaterialList.done[i] += MRFZ.CheckNumber(result.points[0]);
            }
        }
        SendM(
            MaterialList.name[i] +
                ":目标" +
                MaterialList.number[i] +
                " 已得" +
                MaterialList.done[i]
        );
        if (MaterialList.number[i] - MaterialList.done[i] >= 1)
            complete = false;
    }
    capture1.recycle();
    capture2.recycle();
    capture3.recycle();
    storage.put("list", MaterialList);
    SendM({ type: "count_material", message: MaterialList });
    MRFZ.capture.recycle();
    MRFZ.image.recycle();
    return complete;
}

function ScaleSet() {
    let DeviceHeight = device.height,
        DeviceWidth = device.width,
        DefaultWidth = 1080,
        DefaultHeight = 1920;
    let DefaultDelta = DefaultHeight / DefaultWidth,
        DeviceDelta = DeviceHeight / DeviceWidth,
        HeightDelta = DeviceHeight - DefaultHeight,
        WidthDeata = DeviceWidth - DefaultWidth;
    if (!setting.SplitScreen) {
        if (DefaultDelta < DeviceDelta) {
            return DeviceWidth / DefaultWidth;
        } else {
            return DeviceHeight / DefaultHeight;
        }
    } else {
        return DeviceWidth / DefaultHeight;
    }
}

module.exports = startClick;
