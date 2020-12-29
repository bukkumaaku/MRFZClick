"ui";

importClass(android.view.View);
var _sleep = sleep;
sleep = (e) => {
	_sleep(e + Math.pow(10, e.toString().length - 1));
};

if (!files.exists("./setting.js")) {
	files.create("./setting.js");
	toast("文件丢失，已创建");
}

let setting = files.read("./setting.js", (encoding = "utf-8"));
if (setting) {
	setting = JSON.parse(setting);
} else {
	setting = {};
}
if (!setting.recycles) {
	setting.recycles = 1;
}
if (!setting.UseOriginiumsNumber) {
	setting.UseOriginiumsNumber = 1;
}

ui.layout(
	<drawer id="drawer">
		<vertical>
			<appbar>
				<toolbar id="toolbar" title="明日方舟连点器" />
				<tabs id="tabs" />
			</appbar>
			<viewpager id="viewpager">
				<frame>
					<vertical marginLeft="20" marginRight="20" marginTop="20">
						<checkbox id="isRecycle" checked="{{setting.isRecycle}}" text="限制运行循环" textSize="20sp" />
						<horizontal id="recycleTimes">
							<input id="recycles" w="100" inputType="number" text="{{setting.recycles}}" />
							<text text="循环多少次" textSize="20sp" textColor="black" />
						</horizontal>
						<checkbox id="UseSanMedician" checked="{{setting.UseSanMedician}}" text="是否使用理智药剂" textSize="20sp" />
						<checkbox id="UseOriginiums" checked="{{setting.UseOriginiums}}" text="是否使用源石补充理智" textSize="20sp" />
						<horizontal id="UseOriginiumsNumberCount">
							<input id="UseOriginiumsNumber" w="100" inputType="number" text="{{setting.UseOriginiumsNumber}}" />
							<text text="使用多少颗源石" textSize="20sp" textColor="black" />
						</horizontal>
						<checkbox id="openFloaty" checked="{{setting.openFloaty}}" text="是否打开悬浮窗" textSize="20sp" />
						<checkbox id="autoservice" text="*打开无障碍服务" checked="{{auto.service != null}}" textColor="red" textSize="20sp" />
						<text text="*停止脚本按音量上键" textColor="red" textSize="20sp" />
						<button id="start" text="开始" textSize="20sp" />
					</vertical>
				</frame>
				<frame>
					<vertical marginLeft="20" marginRight="20" marginTop="20">
						<button
							w="*"
							h="auto"
							id="CheckUpdate"
							textSize="18sp"
							text="检查更新"
							style="Widget.AppCompat.Button.Borderless.Colored"
							textColor="black"
							gravity="left"
							gravity="center_vertical"
						/>
						<button
							w="*"
							h="auto"
							textSize="18sp"
							text="关于"
							style="Widget.AppCompat.Button.Borderless.Colored"
							textColor="black"
							gravity="left"
							gravity="center_vertical"
							id="About"
						/>
					</vertical>
				</frame>
			</viewpager>
		</vertical>
	</drawer>
);

DownloadNewVersion();

if (!setting.isRecycle) ui.recycleTimes.setVisibility(View.GONE);
if (!setting.UseOriginiums) ui.UseOriginiumsNumberCount.setVisibility(View.GONE);

ui.isRecycle.on("check", (checked) => {
	if (checked) {
		ui.recycleTimes.setVisibility(View.VISIBLE);
	} else {
		ui.recycleTimes.setVisibility(View.GONE);
	}
});
ui.UseOriginiums.on("check", (checked) => {
	if (checked) {
		ui.UseOriginiumsNumberCount.setVisibility(View.VISIBLE);
	} else {
		ui.UseOriginiumsNumberCount.setVisibility(View.GONE);
	}
});

ui.isRecycle.on("check", (checked) => {
	setting.isRecycle = checked;
	files.write("./setting.js", JSON.stringify(setting), (encoding = "utf-8"));
});

ui.UseSanMedician.on("check", (checked) => {
	setting.UseSanMedician = checked;
	files.write("./setting.js", JSON.stringify(setting), (encoding = "utf-8"));
});

ui.UseOriginiums.on("check", (checked) => {
	setting.UseOriginiums = checked;
	files.write("./setting.js", JSON.stringify(setting), (encoding = "utf-8"));
});

ui.openFloaty.on("check", (checked) => {
	floaty.clo;
	setting.openFloaty = checked;
	files.write("./setting.js", JSON.stringify(setting), (encoding = "utf-8"));
});

ui.recycles.addTextChangedListener({
	afterTextChanged: (string) => {
		setting.recycles = Number(string);
		files.write("./setting.js", JSON.stringify(setting), (encoding = "utf-8"));
	},
});
//设置滑动页面的标题
ui.viewpager.setTitles(["设置", "关于"]);
//让滑动页面和标签栏联动
ui.tabs.setupWithViewPager(ui.viewpager);

ui.autoservice.on("check", (checked) => {
	if (checked) {
		auto();
	} else {
		app.startActivity({
			action: "android.settings.ACCESSIBILITY_SETTINGS",
		});
	}
});

ui.emitter.on("resume", function () {
	// 此时根据无障碍服务的开启情况，同步开关的状态
	ui.autoservice.checked = auto.service != null;
});

ui.start.on("click", () => {
	if (!auto.service) {
		toast("请打开无障碍服务");
	} else {
		threads.start(startClick);
	}
});

ui.CheckUpdate.click(function () {
	DownloadNewVersion();
});

ui.About.click(function () {
	toast("莫得关于");
});

function DownloadNewVersion() {
	toast("正在查询是否有更新");
	http.get("https://raw.githubusercontent.com/bukkumaaku/MRFZClick/main/VersionCode.json", {}, function (GetVersionCodeHttp) {
		if (GetVersionCodeHttp.statusCode == 200) {
			let VersionCodeMessage = JSON.parse(GetVersionCodeHttp.body.string());
			let NowVersionCode = app.versionCode;
			if (Number(VersionCodeMessage.VersionCode) > NowVersionCode) {
				let IsDownload = confirm("发现更新", "更新日志：\n" + VersionCodeMessage.Description + "\n需要打开浏览器下载吗");
				if (IsDownload) {
					app.openUrl("https://github.com/bukkumaaku/MRFZClick/releases");
				}
			} else {
				toast("已是最新版");
			}
		} else {
			toast("查询失败");
		}
	});
}
