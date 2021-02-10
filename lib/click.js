var setting = JSON.parse(files.read("./setting.js", (encoding = "utf-8")));
var MRFZ = require("./lib/MRFZ.js");
var storage = storages.create("MRFZClickMaterialList");
var MaterialList = JSON.parse(storage.get("list"));
const _sleep = sleep;
const _toastLog = toastLog;
var allengins = engines.all();
var fatherengine;
var isCountBattleNumber = true;
var speed = 1;
if (setting.TwoSpeed) {
	speed = 2;
}
sleep(500);
for (let i = 0; i < allengins.length; i++) {
	if (allengins[i].toString().indexOf("floaty.js") != -1) {
		fatherengine = allengins[i];
	}
}
sleep = (e) => {
	_sleep(e + Math.pow(10, e.toString().length - 1));
};
var SendM = (e) => {
	log(e);
	fatherengine.emit("sendmessage", e);
};
toastLog = (e) => {
	_toastLog(e);
	SendM(e);
};

requestScreenCapture();

var isStart = true;

events.on("sm", function (words) {
	isStart = Boolean(Number(words));
	if (isStart) {
		toastLog("停止运行");
	} else {
		toastLog("开始运行");
	}
});

toastLog("请启动明日方舟");

var result,
	result2,
	capture,
	UseOriginiumsCount = 0,
	Action = true,
	CountBattleNumber = 1,
	SleepTime = 2000;

threads.start(startClick);

function startClick() {
	var StopProcess = (e) => {
		UseOriginiumsCount = 0;
		CountBattleNumber = 1;
		isStart = true;
		if (e) toastLog(e);
		fatherengine.emit("stopit", 1);
		fatherengine.emit("settitle", "结束行动");
	};

	while (Action) {
		sleep(SleepTime / speed);

		if (isStart) {
			continue;
		}
		capture = captureScreen();
		sleep(500);
		result = MRFZ.GetButton(capture, "BlueActionButton");
		result2 = MRFZ.GetButton(capture, "BlueActionButtonWithSan");

		if (result || result2) {
			toastLog("点击 蓝·开始行动");
			fatherengine.emit("settitle", "第" + CountBattleNumber + "轮行动");
			MRFZ.ClickButton(result ? result : result2);
			SleepTime = 2000;
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
			SleepTime = 5000;
			continue;
		}

		result = MRFZ.GetButton(capture, "InBattle");

		if (result) {
			continue;
		}

		result = MRFZ.GetButton(capture, "EndInterface");
		result1 = MRFZ.GetButton(capture, "EndExterminateInterface");

		if (result || result1) {
			sleep(1500);
			MRFZ.ClickButton(result ? result : result1);
			toastLog("结束第" + Number(CountBattleNumber - 1) + "轮");
			isCountBattleNumber = true;
			SleepTime = 5000;
			capture = captureScreen();
			if (
				(setting.isRecycle &&
					CountBattleNumber > Number(setting.recycles)) ||
				CountMaterial(capture)
			) {
				StopProcess(
					"已完成目标设定次数，使用了" + UseOriginiumsCount + "颗源石"
				);
				continue;
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

		result = MRFZ.GetButton(capture, "EndExterminate");
		if (result) {
			MRFZ.ClickButton(result);
			continue;
		}
	}
}

function CountMaterial(capture) {
	if (!setting.CountMaterial || MaterialList.number.length < 1) return false;
	if (CountBattleNumber != 1) images.save(capture, "/sdcard/1.png");
	let complete = true;
	capture = images.grayscale(capture);
	capture = images.threshold(capture, 130, 255, "BINARY");
	capture = images.cvtColor(capture, "GRAY2BGRA");
	//遍历已添加的材料
	for (let i = 0; i < MaterialList.name.length; i++) {
		//获取返回结果
		var result = MRFZ.GetMaterial(capture, MaterialList.name[i]);
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
	MRFZ.RecycleCapture();
	storage.put("list", MaterialList);
	return complete;
}
