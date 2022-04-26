/***
 * @achivement 需要实现的功能有：次数、源石、材料多少（进度条）、公招
 */
importClass(android.view.View);
importClass(android.graphics.drawable.GradientDrawable);

var setting = JSON.parse(
        files.read("./lib/setting.json", (encoding = "utf-8"))
    ),
    storage = storages.create("MRFZClickMaterialList"),
    MaterialList = JSON.parse(storage.get("list"));

function show_floaty() {
    var win = floaty.window(
        <card w="195" h="70" id="mainFloaty">
            <vertical bg="#60000000">
                <horizontal gravity="right" bg="#50000000">
                    <img
                        src="@drawable/ic_assignment_ind_black_48dp"
                        tint="#eeeeee"
                        w="25"
                        h="25"
                        id="recruit"
                    />
                    <horizontal id="bar" w="95" h="*"></horizontal>
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
                <vertical w="*" h="20" id="container"></vertical>
            </vertical>
        </card>
    );

    ui.run(function () {
        let AddView = ui.inflate(
            <frame>
                <horizontal id="count_bar" h="20" bg="#90F8AC4F"></horizontal>
                <horizontal w="*" h="20">
                    <text
                        id="count_text"
                        text=""
                        gravity="center_vertical"
                        textColor="#ffffff"
                    ></text>
                </horizontal>
            </frame>,
            win.container
        );
        win.container.addView(AddView);
        win.count_bar.attr("w", setting.isRecycle ? 0 : 195);
        win.count_text.setText(
            setting.isRecycle ? "计：0/" + setting.recycles : "计：0/∞"
        );

        if (setting.UseOriginiums) {
            win.mainFloaty.attr("h", 90);
            win.container.attr("h", 40);
            let AddView = ui.inflate(
                <frame>
                    <horizontal
                        id="count_originiums_bar"
                        w="0"
                        h="20"
                        bg="#90F84F4F"
                    ></horizontal>
                    <horizontal w="*" h="20">
                        <text
                            id="count_originiums_text"
                            text=""
                            gravity="center_vertical"
                            textColor="#ffffff"
                        ></text>
                    </horizontal>
                </frame>,
                win.container
            );
            win.container.addView(AddView);
            win.count_originiums_text.setText(
                "源：0/" + setting.UseOriginiumsNumber
            );
        }

        if (setting.CountMaterial && MaterialList.number.length >= 1) {
            let wh = parseInt(win.mainFloaty.attr("h"));
            win.mainFloaty.attr("h", wh + MaterialList.number.length * 20);
            let ch = parseInt(win.container.attr("h"));
            win.container.attr("h", ch + MaterialList.number.length * 20);
            for (let i = 0; i < MaterialList.name.length; i++) {
                let rgb =
                    random(16, 255).toString(16) +
                    random(16, 255).toString(16) +
                    random(16, 255).toString(16);
                let AddView = ui.inflate(
                    '\
					<frame>\
						<horizontal id="count_m' +
                        i +
                        '" w="0" h="20" bg="#90' +
                        rgb +
                        '"></horizontal>\
						<horizontal w="*" h="20">\
							<img src="file://./res/material/' +
                        MaterialList.name[i] +
                        '.png" h="20" w="20" />\
							<text id="count_t' +
                        i +
                        '" text=" 0/' +
                        MaterialList.number[i] +
                        '" gravity="center_vertical" textColor="#ffffff"></text>\
						</horizontal>\
					</frame>',
                    win.container
                );
                win.container.addView(AddView);
            }
        }

        win.setPosition(25, 110);
        let g = new GradientDrawable();
        g.setCornerRadius(18);
        win.mainFloaty.setBackground(g);
    });

    var winHeight = win.mainFloaty.attr("h"),
        winWidth = win.mainFloaty.attr("w"),
        x,
        y,
        wx,
        wy,
        bw;

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
        toast("关闭脚本");
        engines.stopAll();
    });

    win.recruit.click(function () {
        require("./recruit.js")();
    });

    win.StartClick.click(function () {
        ui.run(function () {
            let set_button =
                win.StartClick.attr("tint") == "#fa5858"
                    ? [
                          false,
                          "@drawable/ic_pause_circle_outline_black_48dp",
                          "#82fa58",
                      ]
                    : [
                          true,
                          "@drawable/ic_play_circle_outline_black_48dp",
                          "#fa5858",
                      ];

            ThreadCommunicate.emit("to_click", set_button[0]);
            win.StartClick.attr("src", set_button[1]);
            win.StartClick.attr("tint", set_button[2]);
        });
    });

    ThreadCommunicate.on("tofloaty", function (e) {
        switch (e.type) {
            case "count_material":
                ui.run(function () {
                    for (let i = 0; i < e.message.number.length; i++) {
                        let d = e.message.done[i],
                            n = e.message.number[i];
                        win.findView("count_t" + i).setText(" " + d + "/" + n);
                        win.findView("count_m" + i).attr(
                            "w",
                            d <= n ? parseInt((d / n) * 195) : 195
                        );
                    }
                });
                break;
            case "stop_signal":
                ui.run(function () {
                    if (e.message) {
                        win.StartClick.attr(
                            "src",
                            "@drawable/ic_play_circle_outline_black_48dp"
                        );
                        win.StartClick.attr("tint", "#fa5858");
                    }
                });
                break;
            case "set_title":
                ui.run(function () {
                    win.settitle.setText(e.message);
                });
                break;
            case "count":
                ui.run(function () {
                    win.count_text.setText(
                        setting.isRecycle
                            ? "计：" + e.message + "/" + setting.recycles
                            : "计：" + e.message + "/∞"
                    );
                    if (setting.isRecycle) {
                        win.count_bar.attr(
                            "w",
                            parseInt((195 * e.message) / setting.recycles)
                        );
                    }
                });
                break;
            case "count_originiums":
                ui.run(function () {
                    win.count_originiums_text.setText(
                        "源：" + e.message + "/" + setting.UseOriginiumsNumber
                    );
                    if (setting.UseOriginiums) {
                        win.count_originiums_bar.attr(
                            "w",
                            parseInt(
                                (195 * e.message) / setting.UseOriginiumsNumber
                            )
                        );
                    }
                });
                break;
        }
    });
}

module.exports = show_floaty;
