importClass(android.view.View);
importClass(android.graphics.drawable.GradientDrawable);
var allengins = engines.all();
var childengine;
var win = floaty.window(
	<card w="195" h="170" id="mainFloaty">
		<vertical bg="#60000000">
			<horizontal gravity="right" bg="#50000000">
				<horizontal id="bar" w="*" h="*"></horizontal>
				<img
					src="@drawable/ic_play_circle_outline_black_48dp"
					tint="#fa5858"
					w="25"
					h="25"
					id="StartClick"
				/>
				<img
					src="@drawable/ic_remove_black_48dp"
					w="25"
					h="25"
					tint="white"
					id="minWindow"
				/>
				<img
					src="@drawable/ic_highlight_off_black_48dp"
					w="25"
					h="25"
					tint="white"
					id="closeWindow"
				/>
			</horizontal>
			<text
				id="settitle"
				h="25"
				text="未开始"
				textColor="#ffffff"
				gravity="center_vertical"
				bg="#900174df"
			/>
			<vertical w="*" h="120">
				<ScrollView
					id="sb"
					h="*"
					scrollbars="vertical"
					fadingEdge="vertical"
				>
					<TextView w="*" id="LogTxt" h="*" textColor="#ffffff" />
				</ScrollView>
			</vertical>
		</vertical>
	</card>
);
win.setPosition(25, 110);
ui.run(function () {
	let g = new GradientDrawable();
	g.setCornerRadius(18);
	win.mainFloaty.setBackground(g);
});
var settime = setInterval(closetime, 1000);
var isclose = false;
var winHeight = win.mainFloaty.attr("h");
var winWidth = win.mainFloaty.attr("w");

function closetime() {
	if (isclose) clearInterval(settime);
}
var x, y, wx, wy, bw;
win.bar.setOnTouchListener(function (view, event) {
	switch (event.getAction()) {
		case event.ACTION_DOWN:
			x = event.getRawX();
			y = event.getRawY();
			wx = win.getX();
			wy = win.getY();
			break;
		case event.ACTION_MOVE:
			win.setPosition(
				wx + (event.getRawX() - x),
				wy + (event.getRawY() - y)
			);
			break;
	}
	return true;
});
win.minWindow.setOnTouchListener(function (view, event) {
	switch (event.getAction()) {
		case event.ACTION_DOWN:
			x = event.getRawX();
			y = event.getRawY();
			wx = win.getX();
			wy = win.getY();
			break;
		case event.ACTION_MOVE:
			win.setPosition(
				wx + (event.getRawX() - x),
				wy + (event.getRawY() - y)
			);
			break;
		case event.ACTION_UP:
			if (
				Math.abs(event.getRawY() - y) < 5 &&
				Math.abs(event.getRawX() - x) < 5
			) {
				bw = win.minWindow.getWidth();
				ui.run(function () {
					if (win.mainFloaty.attr("h") != "25") {
						win.mainFloaty.attr("h", "25");
						win.mainFloaty.attr("w", "25");
						win.closeWindow.setVisibility(View.GONE);
						win.setPosition(wx + (bw / 25) * 140, wy);
						win.minWindow.attr(
							"src",
							"@drawable/ic_zoom_out_map_black_48dp"
						);
					} else {
						win.mainFloaty.attr("h", winHeight);
						win.mainFloaty.attr("w", winWidth);
						win.closeWindow.setVisibility(View.VISIBLE);
						win.setPosition(wx - (bw / 25) * 140, wy);
						win.minWindow.attr(
							"src",
							"@drawable/ic_remove_black_48dp"
						);
					}
				});
			}
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
		if (win.StartClick.attr("tint") == "#fa5858") {
			for (let i = 0; i < allengins.length; i++) {
				if (allengins[i].toString().indexOf("click.js") != -1) {
					childengine = allengins[i];
				}
			}
			childengine.emit("sm", "0");
			win.StartClick.attr(
				"src",
				"@drawable/ic_pause_circle_outline_black_48dp"
			);
			win.StartClick.attr("tint", "#82fa58");
		} else {
			for (let i = 0; i < allengins.length; i++) {
				if (allengins[i].toString().indexOf("click.js") != -1) {
					childengine = allengins[i];
				}
			}
			childengine.emit("sm", "1");
			win.StartClick.attr(
				"src",
				"@drawable/ic_play_circle_outline_black_48dp"
			);
			win.StartClick.attr("tint", "#fa5858");
		}
	});
});
events.on("sendmessage", function (words) {
	ui.run(function () {
		win.LogTxt.setText(
			win.LogTxt.getText() + (win.LogTxt.getText() ? "\n" : "") + words
		);
		threads.start(function () {
			sleep(200);
			win.sb.fullScroll(View.FOCUS_DOWN);
			threads.shutDownAll();
		});
	});
});
events.on("stopit", function (words) {
	ui.run(function () {
		if (Boolean(words)) {
			win.StartClick.attr(
				"src",
				"@drawable/ic_play_circle_outline_black_48dp"
			);
			win.StartClick.attr("tint", "#fa5858");
		}
	});
});
events.on("settitle", function (words) {
	ui.run(function () {
		win.settitle.setText(words);
	});
});
