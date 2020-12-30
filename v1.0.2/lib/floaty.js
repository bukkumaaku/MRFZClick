importClass(android.view.View);
var allengins = engines.all();
var childengine;

var win = floaty.window(
    <vertical w="200" h="165" id="mainFloaty" bg="#60000000">
        <horizontal gravity="right" bg="#30000000">
            <horizontal id="bar" w="*" h="*">
            </horizontal>
            <img src="@drawable/ic_remove_black_48dp" w="25" h="25" tint="white" id="minWindow" />
            <img src="@drawable/ic_close_black_48dp" w="25" h="25" tint="white" id="closeWindow" />
        </horizontal>
        <vertical w="*" h="100">
            <ScrollView id="sb" h="100"  scrollbars="vertical" fadingEdge="vertical">
                <TextView w="*" id="LogTxt" h="*" textColor="#ffffff" />
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
        >
    </button>
    </vertical>
);
var settime = setInterval(closetime, 1000);
var isclose = false;

function closetime() {
    if (isclose) clearInterval(settime);
}
var x, y, wx, wy, bw = win.mainFloaty.getWidth() - win.minWindow.getWidth();
win.bar.setOnTouchListener(function(view, event) {
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
win.minWindow.setOnTouchListener(function(view, event) {
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
        case event.ACTION_UP:
            if (Math.abs(event.getRawY() - y) < 5 && Math.abs(event.getRawX() - x) < 5) {
                ui.run(function() {
                    if (win.mainFloaty.attr("h") != "25") {
                        bw = win.mainFloaty.getWidth() - win.closeWindow.getWidth();
                        win.mainFloaty.attr("h", "25");
                        win.mainFloaty.attr("w", "25");
                        win.closeWindow.setVisibility(View.GONE);
                        win.setPosition(wx, wy);
                    } else {
                        win.mainFloaty.attr("h", "165");
                        win.mainFloaty.attr("w", "200");
                        win.closeWindow.setVisibility(View.VISIBLE);
                        win.setPosition(wx, wy);
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
win.StartClick.click(function() {
    ui.run(function() {
        if (win.StartClick.getText() == "开始行动") {
            //clickScript = engines.execScriptFile("./lib/click.js");
            for (let i = 0; i < allengins.length; i++) {
                if (allengins[i].source.toString().indexOf("click") != -1) {
                    childengine = allengins[i];
                }
            }
            childengine.emit("sm", "0");
            win.StartClick.setText("停止行动");
        } else {
            //clickScript.forceStop();
            for (let i = 0; i < allengins.length; i++) {
                if (allengins[i].source.toString().indexOf("click") != -1) {
                    childengine = allengins[i];
                }
            }
            childengine.emit("sm", "1");
            win.StartClick.setText("开始行动");
        }
    });
});
events.on("sendmessage", function(words) {
    ui.run(function() {
        win.LogTxt.setText(win.LogTxt.getText() + "\n" + words);
        threads.start(function() {
            sleep(100);
            win.sb.fullScroll(View.FOCUS_DOWN);
            threads.shutDownAll();
        });
    });
});