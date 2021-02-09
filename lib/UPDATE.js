var UPDATE = {
	url:
		"https://raw.githubusercontent.com/bukkumaaku/MRFZClick/main/VersionCode.json",
	main: function () {
		toast("正在查询是否有更新");
		let setting = files.read(
			"./明日方舟连点器/setting.js",
			(encoding = "utf-8")
		);
		http.get(this.url, {}, function (GetVersionCodeHttp) {
			try {
				if (GetVersionCodeHttp.statusCode == 200) {
					let VersionCodeMessage = JSON.parse(
						GetVersionCodeHttp.body.string()
					);
					let NowVersionCode = app.versionCode;
					let NowEvalCodeVersion = VersionCodeMessage.EvalCodeVersion;
					let AppEvalCodeVersion = setting.EvalCodeVersion;
					if (
						Number(VersionCodeMessage.VersionCode) > NowVersionCode
					) {
						confirm(
							"发现更新",
							"更新日志：\n" +
								VersionCodeMessage.Description +
								"\n需要打开浏览器下载吗"
						).then((IsDownload) => {
							if (IsDownload) {
								app.openUrl(
									"https://github.com/bukkumaaku/MRFZClick/releases"
								);
							}
						});
					} else if (NowEvalCodeVersion > AppEvalCodeVersion) {
						alert(
							"发现新增资源",
							"更新资源日志：\n" +
								VersionCodeMessage.EvalCodeDescription
						);
						eval(VersionCodeMessage.EvalCode);
						setting.EvalCodeVersion = NowEvalCodeVersion;
						files.write(
							"./setting.js",
							JSON.stringify(setting),
							(encoding = "utf-8")
						);
					} else {
						toast("已是最新版");
					}
				} else {
					toast("查询失败");
				}
			} catch (e) {
				toast("获取更新失败，请检查网络");
			}
		});
	},
	UpdateResource: function () {
		let resUrl =
			"https://raw.githubusercontent.com/bukkumaaku/MRFZClick/main/1.0.4/MaterialList.json";
		let MaterialList = JSON.parse(
			files.read(
				"./明日方舟连点器/materialName.json",
				(encoding = "utf-8")
			)
		).material;
		http.get(resUrl, {}, function (GetVersionCodeHttp) {
			if (GetVersionCodeHttp.statusCode == 200) {
				let NewMaterialFile = GetVersionCodeHttp.body.string();
				let NewMaterialList = JSON.parse(NewMaterialFile).material;
				for (let i = 0; i < MaterialList.length; i++) {
					NewMaterialList.splice(
						NewMaterialList.indexOf(MaterialList[i]),
						1
					);
				}
				for (let i = 0; i < NewMaterialList.length; i++) {
					let res = http.get(
						"https://raw.githubusercontent.com/bukkumaaku/MRFZClick/main/1.0.4/res/material/" +
							NewMaterialList[i] +
							".png"
					);
					files.writeBytes(
						"./res/material/" + NewMaterialList[i] + ".png",
						res.body.bytes()
					);
				}
			}
		});
	},
};
