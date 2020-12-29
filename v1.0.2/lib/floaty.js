var win = floaty.window(
	<vertical w="200" h="165" bg="#60000000">
		<horizontal gravity="right" bg="#30000000">
			<horizontal id="bar" w="*" h="*"></horizontal>
			<img src="@drawable/ic_close_black_48dp" w="25" h="25" id="closeWindow"></img>
		</horizontal>
		<vertical w="100" h="100">
			<ScrollView scrollbars="vertical" fadingEdge="vertical">
				<TextView layout_width="fill_parent" layout_height="wrap_content" id="LogTxt" textSize="20" textColor="#071907" />
			</ScrollView>
		</vertical>
		<button
			bg="#30000000"
			textColor="black"
			w="*"
			id="StartClick"
			h="40"
			text="开始行动"
			style="Widget.AppCompat.Button.Borderless.Colored"
			textColor="white"
		></button>
	</vertical>
);
var settime = setInterval(closetime, 1000);
var isclose = false;
function closetime() {
	if (isclose) clearInterval(settime);
}
var x, y, wx, wy;
win.bar.setOnTouchListener(function (view, event) {
	switch (event.getAction()) {
		case event.ACTION_DOWN:
			x = event.getRawX();
			y = event.getRawY();
			wx = win.getX();
			wy = win.getY();
			break;
		case event.ACTION_MOVE:
			win.setPosition(wx + (event.getRawX() - x), wy + (event.getRawY() - y));
			break;
	}
	return true;
});
win.closeWindow.click(() => {
	win.close();
	isclose = true;
});
var clickScript;
win.StartClick.click(function () {
	ui.run(function () {
		if (win.StartClick.getText() == "开始行动") {
			clickScript = engines.execScriptFile("./明日方舟点击/lib/click.js");
			win.StartClick.setText("停止行动");
		} else {
			clickScript.forceStop();
			win.StartClick.setText("开始行动");
		}
	});
});
//log(engines.all());
