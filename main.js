"ui";
importClass(android.widget.SpinnerAdapter);
importClass(android.view.ViewGroup);
importClass(android.view.View);
importClass(android.widget.TextView);

var UPDATE = require("./lib/UPDATE.js");

if (!files.exists("./lib/setting.json")) {
	files.create("./lib/setting.json");
	toast("配置文件丢失，已创建");
}

let setting = files.read("./lib/setting.json", (encoding = "utf-8"));
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
var MaterialList = JSON.parse(
	files.read("./lib/materialName.json", (encoding = "utf-8"))
).material;
var MaterialMenu = MaterialList.join("|"),
	AddItem,
	AddItemList = [],
	AddItemNum = 1;
var ImgPath = "file://./res/material/";
ui.layout(
	<drawer id="drawer">
		<vertical>
			<appbar>
				<toolbar
					id="toolbar"
					layout_gravity="left"
					textSize="20sp"
					layout_weight="1"
					title="明日方舟连点器"
				/>
				<tabs id="tabs" />
			</appbar>
			<frame>
				<viewpager id="viewpager">
					<frame>
						<vertical
							marginLeft="20"
							marginRight="20"
							marginTop="20"
							id="start"
						>
							<Switch
								id="autoservice"
								text="*打开无障碍服务"
								checked="{{auto.service != null}}"
								textColor="red"
								textSize="20sp"
							/>
							<Switch
								id="openFloaty"
								text="*打开悬浮窗权限"
								checked="{{floaty.checkPermission()}}"
								textColor="red"
								textSize="20sp"
							/>
							<vertical id="showList">
								<Switch
									id="isRecycle"
									checked="{{setting.isRecycle}}"
									text="限制运行循环"
									textSize="20sp"
								/>
								<horizontal id="recycleTimes">
									<input
										id="recycles"
										w="100"
										inputType="number"
										text="{{setting.recycles}}"
									/>
									<text
										text="循环多少次"
										textSize="20sp"
										textColor="black"
									/>
								</horizontal>
								<Switch
									id="UseOriginiums"
									checked="{{setting.UseOriginiums}}"
									text="是否使用源石补充理智"
									textSize="20sp"
								/>
								<horizontal id="UseOriginiumsNumberCount">
									<input
										id="UseOriginiumsNumber"
										w="100"
										inputType="number"
										text="{{setting.UseOriginiumsNumber}}"
									/>
									<text
										text="使用多少颗源石"
										textSize="20sp"
										textColor="black"
									/>
								</horizontal>
								<Switch
									id="UseSanMedician"
									checked="{{setting.UseSanMedician}}"
									text="是否使用理智药剂"
									textSize="20sp"
								/>
								<Switch
									id="TwoSpeed"
									checked="{{setting.TwoSpeed}}"
									text="识别速度x2（耗电增加）"
									textSize="20sp"
								/>
								<Switch
									id="SplitScreen"
									checked="{{setting.SplitScreen}}"
									text="识别屏幕方向(关闭为横屏)"
									textSize="20sp"
								/>
								<text
									text="*停止脚本按音量上键"
									textColor="red"
									textSize="20sp"
								/>
							</vertical>
						</vertical>
					</frame>
					<frame>
						<vertical
							marginLeft="20"
							marginRight="20"
							marginTop="20"
							id="material"
						>
							<Switch
								id="limitMaterial"
								text="是否指定所需材料"
								checked="{{setting.CountMaterial}}"
								textSize="20sp"
								marginBottom="15sp"
							/>
							<vertical id="materialList">
								<horizontal>
									<spinner
										id="chooseMaterial"
										w="300"
										h="59"
										spinnerMode="dialog"
									/>
									<card
										w="40"
										h="40"
										cardBackgroundColor="#009788"
										layout_gravity="right|center"
										cardCornerRadius="20"
									>
										<text
											text="+"
											w="40"
											height="40"
											textSize="20sp"
											textColor="#ffffff"
											gravity="center"
											id="addMaterial"
											foreground="?selectableItemBackground"
										/>
									</card>
								</horizontal>
								<ScrollView marginTop="20">
									<vertical id="addMaterialList"></vertical>
								</ScrollView>
							</vertical>
						</vertical>
					</frame>
					<frame>
						<vertical
							marginLeft="20"
							marginRight="20"
							marginTop="20"
							id="about"
						>
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
								id="SubmitIssues"
								textSize="18sp"
								text="反馈问题"
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
				<card
					w="60"
					h="60"
					cardBackgroundColor="#009788"
					layout_gravity="bottom|right"
					marginRight="20"
					marginBottom="50"
					cardCornerRadius="30"
				>
					<text
						w="*"
						h="*"
						id="startC"
						textColor="#ffffff"
						gravity="center"
						text="开始"
						textSize="15sp"
						foreground="?selectableItemBackground"
					/>
				</card>
			</frame>
		</vertical>
	</drawer>
);
/*****************************界面初始化开始************************************/
//ui.statusBarColor("#b5b5b5");更改状态栏颜色
//设置滑动页面的标题
ui.viewpager.setTitles(["设置", "材料", "关于"]);
//让滑动页面和标签栏联动
ui.tabs.setupWithViewPager(ui.viewpager);

UPDATE.main();

let storage = storages.create("MRFZClickMaterialList");
let ItemList = storage.get("list");
if (ItemList) {
	if (typeof ItemList == "string") {
		ItemList = JSON.parse(ItemList);
	}
	for (let i = 0; i < ItemList.name.length; i++) {
		let delta = ItemList.number[i] - ItemList.done[i];
		if (delta > 0) {
			AddMaterial(ItemList.name[i], delta);
		}
	}
}
/*****************************界面初始化结束************************************/

/*****************************第一标签页内容开始************************************/

//判断是否显示轮转次数、使用源石个数的输入框
if (!setting.isRecycle) ui.recycleTimes.attr("visibility", "gone");
if (!setting.UseOriginiums)
	ui.UseOriginiumsNumberCount.attr("visibility", "gone");

showList();

//判断是否显示轮转输入框
ui.isRecycle.on("check", (checked) => {
	if (checked) {
		ui.recycleTimes.attr("visibility", "visible");
	} else {
		ui.recycleTimes.attr("visibility", "gone");
	}
});

//判断是否显示使用源石个数输入框
ui.UseOriginiums.on("check", (checked) => {
	if (checked) {
		ui.UseOriginiumsNumberCount.attr("visibility", "visible");
	} else {
		ui.UseOriginiumsNumberCount.attr("visibility", "gone");
	}
});

//点击是否循环
ui.isRecycle.on("check", (checked) => {
	setting.isRecycle = checked;
	files.write(
		"./lib/setting.json",
		JSON.stringify(setting),
		(encoding = "utf-8")
	);
});

//点击是否使用理智药剂
ui.UseSanMedician.on("check", (checked) => {
	setting.UseSanMedician = checked;
	files.write(
		"./lib/setting.json",
		JSON.stringify(setting),
		(encoding = "utf-8")
	);
});
ui.TwoSpeed.on("check", (checked) => {
	setting.TwoSpeed = checked;
	files.write(
		"./lib/setting.json",
		JSON.stringify(setting),
		(encoding = "utf-8")
	);
});
ui.SplitScreen.on("check", (checked) => {
	setting.SplitScreen = checked;
	files.write(
		"./lib/setting.json",
		JSON.stringify(setting),
		(encoding = "utf-8")
	);
});

//点击是否使用源石
ui.UseOriginiums.on("check", (checked) => {
	setting.UseOriginiums = checked;
	files.write(
		"./lib/setting.json",
		JSON.stringify(setting),
		(encoding = "utf-8")
	);
});

//点击是否打开悬浮窗
ui.openFloaty.on("check", (checked) => {
	floaty.requestPermission();
});

//使输入框里输入的数字都是自然数
ui.recycles.addTextChangedListener({
	afterTextChanged: (string) => {
		setting.recycles = Number(string);
		files.write(
			"./lib/setting.json",
			JSON.stringify(setting),
			(encoding = "utf-8")
		);
	},
});
ui.UseOriginiumsNumber.addTextChangedListener({
	afterTextChanged: (string) => {
		setting.UseOriginiumsNumber = Number(string);
		files.write(
			"./lib/setting.json",
			JSON.stringify(setting),
			(encoding = "utf-8")
		);
	},
});

//判断是否开启了无障碍服务
ui.autoservice.on("check", (checked) => {
	app.startActivity({
		action: "android.settings.ACCESSIBILITY_SETTINGS",
	});
});

ui.emitter.on("resume", function () {
	// 此时根据无障碍服务的开启情况，同步开关的状态
	ui.autoservice.checked = auto.service != null;
	ui.openFloaty.checked = floaty.checkPermission();
	showList();
});

var FloatyJs, ClickJs;

//点击开始按钮
ui.startC.on("click", () => {
	if (!auto.service) {
		toast("请打开无障碍服务");
	} else if (ui.startC.getText() == "开始") {
		if (!setting.recycles) {
			setting.recycles = 1;
			ui.recycles.setText(1);
		}
		if (!setting.UseOriginiumsNumber) {
			setting.UseOriginiumsNumber = 1;
			ui.UseOriginiumsNumber.setText(1);
		}
		files.write(
			"./lib/setting.json",
			JSON.stringify(setting),
			(encoding = "utf-8")
		);
		CountMaterial();
		files.write(
			"./lib/setting.json",
			JSON.stringify(setting),
			(encoding = "utf-8")
		);
		FloatyJs = engines.execScriptFile("./lib/floaty.js");
		ClickJs = engines.execScriptFile("./lib/click.js");
		ui.startC.setText("停止");
	} else {
		FloatyJs.getEngine().forceStop();
		ClickJs.getEngine().forceStop();
		ui.startC.setText("开始");
	}
});

/*****************************第一标签页内容结束************************************/

/*****************************第二标签页内容开始************************************/

AddMaterialInitial();

//点击是否指定材料
ui.limitMaterial.on("check", (checked) => {
	setting.CountMaterial = checked;
	files.write(
		"./lib/setting.json",
		JSON.stringify(setting),
		(encoding = "utf-8")
	);
	AddMaterialInitial();
});
setTimeout(function () {
	setSpinnerAdapter(ui.chooseMaterial, MaterialList);
}, 50);

ui.addMaterial.click(function () {
	AddMaterial(ui.chooseMaterial.getSelectedItem());
});

/*****************************第二标签页内容结束************************************/

/*****************************第三标签页内容开始************************************/

//点击更新按钮
ui.CheckUpdate.click(function () {
	UPDATE.main();
});

//点击提交意见按钮
ui.SubmitIssues.click(function () {
	app.openUrl("https://github.com/bukkumaaku/MRFZClick/issues");
});

//点击关于按钮
ui.About.click(function () {
	toast("莫得关于");
});

/*****************************第三标签页内容结束************************************/
/*****************************函数存放区************************************/

function AddMaterialInitial() {
	if (ui.limitMaterial.checked) {
		ui.materialList.attr("visibility", "visible");
	} else {
		ui.materialList.attr("visibility", "gone");
	}
}

function CountMaterial() {
	let ChildCount = ui.addMaterialList.getChildCount();
	var MaterialJson = {
		name: [],
		number: [],
		done: [],
	};
	for (let i = 0; i < ChildCount; i++) {
		let name = ui.addMaterialList.getChildAt(i).getChildAt(2).getText();
		let number = Number(
			ui.addMaterialList.getChildAt(i).getChildAt(0).getText()
		);
		if (number <= 0) {
			continue;
		}
		MaterialJson.name.push(name);
		MaterialJson.number.push(number);
		MaterialJson.done.push(0);
	}
	if (MaterialJson.name) {
		let storage = storages.create("MRFZClickMaterialList");
		storage.put("list", JSON.stringify(MaterialJson));
		return true;
	} else {
		return false;
	}
}

function showList() {
	if (floaty.checkPermission() && auto.service) {
		ui.showList.attr("visibility", "visible");
		return "visible";
	} else {
		ui.showList.attr("visibility", "gone");
		return "gone";
	}
}

function AddMaterial(item, num) {
	AddItem = item;
	AddItemNum = num ? num : 1;
	if (AddItemList.indexOf(AddItem) != -1) {
		toast("请不要重复添加相同的材料");
		return;
	}
	AddItemList.push(AddItem);
	let AddText = ui.inflate(
		<horizontal w="*" h="auto" layout_weight="1">
			<input text="{{AddItemNum}}" inputType="number" w="80" />
			<card
				cardCornerRadius="20"
				layout_gravity="center"
				gravity="center"
			>
				<img id="img" src="{{ImgPath}}{{AddItem}}.png" h="40" w="40" />
			</card>
			<text
				text="{{AddItem}}"
				marginLeft="10"
				textSize="18sp"
				textColor="black"
				w="auto"
				layout_weight="1"
			/>

			<card w="40sp" h="40sp" marginRight="13sp" cardCornerRadius="20sp">
				<text
					text="×"
					textSize="20sp"
					textColor="#009788"
					layout_gravity="center"
					gravity="center"
					foreground="?selectableItemBackground"
				/>
			</card>
		</horizontal>,
		ui.addMaterialList
	);
	ui.addMaterialList.addView(AddText);
	var ChildCount = ui.addMaterialList.getChildCount();
	for (let i = 0; i < ChildCount; i++) {
		ui.addMaterialList.getChildAt(i).getChildAt(3).removeAllListeners();
		ui.addMaterialList
			.getChildAt(i)
			.getChildAt(3)
			.click(function (e) {
				AddItemList.splice(
					AddItemList.indexOf(e.getParent().getChildAt(2).getText()),
					1
				);
				ui.addMaterialList.removeView(e.getParent());
				CountMaterial();
			});
	}
	CountMaterial();
}

function setSpinnerAdapter(spinner, dataList) {
	let boxXml = (
		<card w="*" h="61" bg="#009788">
			<horizontal w="*" h="60" bg="#ffffff">
				<card
					marginLeft="20"
					cardCornerRadius="20"
					marginTop="10"
					marginRight="20"
				>
					<img id="img" h="40" w="40" />
				</card>
				<text
					id="name"
					text=""
					gravity="left|center"
					textSize="15sp"
					textColor="black"
					w="*"
					h="60"
				/>
			</horizontal>
		</card>
	);

	function createAdapter(dataList) {
		let adapter = JavaAdapter(android.widget.SpinnerAdapter, {
			getCount: function () {
				return dataList.length;
			},
			getItem: function (position) {
				return dataList[position];
			},
			getItemId: function (position) {
				return position;
			},
			getViewTypeCount: function (position) {
				return 1;
			},
			getView: function (position, convertView, parent) {
				if (!convertView) {
					convertView = ui.inflate(boxXml, ui.drawer, false);
				}
				let item = dataList[position];
				convertView.name.setText(item);
				convertView.img.attr("src", ImgPath + item + ".png");
				return convertView;
			},
			getDropDownView: function (position, convertView, parent) {
				if (!convertView) {
					convertView = ui.inflate(boxXml, ui.drawer, false);
				}
				let item = dataList[position];
				if (convertView.name.getText().toString() != item) {
					convertView.name.setText(item);
					convertView.img.attr("src", ImgPath + item + ".png");
				}
				return convertView;
			},
		});
		return adapter;
	}
	spinner.setAdapter(createAdapter(dataList));
}
