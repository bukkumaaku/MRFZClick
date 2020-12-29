var setting = JSON.parse(files.read("../setting.js", (encoding = "utf-8")));
var MRFZ = require("MRFZ.js");
const _sleep = sleep;

sleep = (e) => {
	_sleep(e + Math.pow(10, e.toString().length - 1));
};

if (!setting.recycles) {
	setting.recycles = 1;
	ui.recycles.setText(1);
}
if (!setting.UseOriginiumsNumber) {
	setting.UseOriginiumsNumber = 1;
	ui.UseOriginiumsNumber.setText(1);
}

requestScreenCapture(true);

if (setting.openFloaty) {
	console.show();
}

launchApp("明日方舟");
toastLog("启动明日方舟");

sleep(3000);

var result,
	result2,
	capture,
	UseOriginiumsCount = 0,
	Action = true,
	CountBattleNumber = 1,
	SleepTime = 2000;

var StopProcess = (e) => {
	Action = false;
	toastLog(e);
	threads.shutDownAll();
};

while (Action) {
	sleep(SleepTime);
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
		if (setting.isRecycle && CountBattleNumber > Number(ui.recycles.getText())) {
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
		if (setting.isRecycle && CountBattleNumber > Number(ui.recycles.getText())) {
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

	if (result && result2 && setting.UseOriginiums && UseOriginiumsCount < Number(ui.UseOriginiumsNumber.getText())) {
		MRFZ.ClickButton(result2);
		UseOriginiumsCount++;
		toastLog("使用第" + UseOriginiumsCount + "源石恢复全部理智");
		continue;
	} else if (result && result2 && ((setting.UseOriginiums && UseOriginiumsCount >= Number(ui.UseOriginiumsNumber.getText())) || !setting.UseOriginiums)) {
		StopProcess("已消耗" + UseOriginiumsCount + "颗源石和全部理智");
		break;
	}

	result = MRFZ.GetButton(capture, "EndExterminate");
	if (result) {
		MRFZ.ClickButton(result);
		continue;
	}
}
