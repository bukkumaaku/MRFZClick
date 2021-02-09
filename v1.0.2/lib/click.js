var setting = JSON.parse(files.read("./setting.js", (encoding = "utf-8")));
var MRFZ = require("./lib/MRFZ.js");
const _sleep = sleep;
const _toastLog = toastLog;
var allengins = engines.all();
var fatherengine;
for (let i = 0; i < allengins.length; i++) {
    if (allengins[i].source.toString().indexOf("floaty") != -1) {
        fatherengine = allengins[i];
    }
}
sleep = (e) => {
    _sleep(e + Math.pow(10, e.toString().length - 1));
};
toastLog = (e) => {
    _toastLog(e);
    if(setting.openFloaty)fatherengine.emit("sendmessage", e);
};

requestScreenCapture(true);

var isStart = true;
if(!setting.openFloaty)isStart = false;

events.on("sm", function(words) {
    isStart = Boolean(Number(words));
    if (isStart) {
        toastLog("停止脚本");
    } else {
        toastLog("开始脚本");
    }
});

launchApp("明日方舟");
toastLog("启动明日方舟");

var result,
    result2,
    capture,
    UseOriginiumsCount = 0,
    Action = true,
    CountBattleNumber = 1,
    SleepTime = 2000;

threads.start(aaa);

function aaa() {
    var StopProcess = (e) => {
        Action = false;
        toastLog(e);
        threads.shutDownAll();
    };


    while (Action) {
        sleep(SleepTime);

        if (isStart) {
            continue;
        }
        capture = captureScreen();
        sleep(500);
        result = MRFZ.GetButton(capture, "BlueActionButton");

        if (result) {
            toastLog("点击 蓝·开始行动");
            MRFZ.ClickButton(result);
            SleepTime = 2000;
            continue;
        }

        result = MRFZ.GetButton(capture, "RedActionButton");

        if (result) {
            toastLog("点击 红·开始行动");
            MRFZ.ClickButton(result);
            SleepTime = 5000;
            continue;
        }

        result = MRFZ.GetButton(capture, "InBattle");

        if (result) {
            continue;
        }

        result = MRFZ.GetButton(capture, "EndInterface");

        if (result) {
            MRFZ.ClickButton(result);
            toastLog("结束第" + CountBattleNumber + "轮");
            CountBattleNumber++;
            SleepTime = 5000;
            if (setting.isRecycle && CountBattleNumber > Number(setting.recycles)) {
                StopProcess("已完成目标设定次数，使用了" + UseOriginiumsCount + "颗源石");
                break;
            } else {
                continue;
            }
        }

        result = MRFZ.GetButton(capture, "EndExterminateInterface");

        if (result) {
            MRFZ.ClickButton(result);
            toastLog("结束第" + CountBattleNumber + "轮");
            CountBattleNumber++;
            SleepTime = 5000;
            if (setting.isRecycle && CountBattleNumber > Number(setting.recycles)) {
                StopProcess("已完成目标设定次数，使用了" + UseOriginiumsCount + "颗源石");
                break;
            } else {
                continue;
            }
        }

        result = MRFZ.GetButton(capture, "UseSanMedician");
        result2 = MRFZ.GetButton(capture, "UseSanMedicianButton");

        if (result && result2 && setting.UseSanMedician) {
            MRFZ.ClickButton(result2);
            toastLog("饮用理智药剂");
            continue;
        } else if (result && !setting.UseSanMedician) {
            StopProcess("已消耗完理智");
            break;
        }

        result = MRFZ.GetButton(capture, "UseOriginiums");
        result2 = MRFZ.GetButton(capture, "UseOriginiumsButton");

        if (result && result2 && setting.UseOriginiums && UseOriginiumsCount < Number(setting.UseOriginiumsNumber)) {
            MRFZ.ClickButton(result2);
            UseOriginiumsCount++;
            toastLog("使用第" + UseOriginiumsCount + "源石恢复全部理智");
            continue;
        } else if (result && result2 && ((setting.UseOriginiums && UseOriginiumsCount >= Number(setting.UseOriginiumsNumber)) || !setting.UseOriginiums)) {
            StopProcess("已消耗" + UseOriginiumsCount + "颗源石和全部理智");
            break;
        }

        result = MRFZ.GetButton(capture, "EndExterminate");
        if (result) {
            MRFZ.ClickButton(result);
            continue;
        }
    }
}