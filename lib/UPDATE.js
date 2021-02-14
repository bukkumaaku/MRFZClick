var DownloadDialog;
var UPDATE = {
	url: "https://gitee.com/bukkumaaku/MRFZClick/raw/main/VersionCode.json",
	DownloadNum: 0,
	setting: "",
	NewMaterialFile: "",
	main: function () {
		toast("正在查询是否有更新");
		let setting = JSON.parse(
			files.read("./setting.js", (encoding = "utf-8"))
		);
		this.setting = setting;
		http.get(this.url, {}, function (GetVersionCodeHttp) {
			try {
				if (
					GetVersionCodeHttp &&
					GetVersionCodeHttp.statusCode == 200
				) {
					let VersionCodeMessage = JSON.parse(
						GetVersionCodeHttp.body.string()
					);
					let NowVersionCode = app.versionCode;
					let NowEvalCodeVersion = VersionCodeMessage.EvalCodeVersion;
					let AppEvalCodeVersion = setting.EvalCodeVersion;
					if (
						Number(VersionCodeMessage.VersionCode) > NowVersionCode
					) {
						let IsDownload = confirm(
							"发现更新",
							"更新日志：\n" +
								VersionCodeMessage.Description +
								"\n需要打开浏览器下载吗"
						);
						if (IsDownload) {
							app.openUrl(
								"https://github.com/bukkumaaku/MRFZClick/releases"
							);
						}
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
							JSON.stringify(UPDATE.setting),
							(encoding = "utf-8")
						);
					} else {
						toastLog("已是最新版");
					}
				} else {
					toastLog("查询失败");
				}
			} catch (e) {
				toastLog("获取更新失败，请检查网络" + "\n" + e);
			}
		});
	},
	UpdateResource: function () {
		let resUrl =
			"https://gitee.com/bukkumaaku/MRFZClick/raw/main/materialName.json";
		let MaterialList = JSON.parse(
			files.read("./materialName.json", (encoding = "utf-8"))
		).material;
		http.get(resUrl, {}, function (material) {
			if (material && material.statusCode == 200) {
				UPDATE.NewMaterialFile = material.body.string();
				let NewMaterialList = JSON.parse(UPDATE.NewMaterialFile)
					.material;
				for (let i = 0; i < MaterialList.length; i++) {
					NewMaterialList.splice(
						NewMaterialList.indexOf(MaterialList[i]),
						1
					);
				}
				alert("共有" + NewMaterialList.length + "个材料需要更新");
				threads.start(function () {
					DownloadDialog = dialogs
						.build({
							title: "下载资源",
							positive: "下载中",
							progress: {
								max: NewMaterialList.length,
								showMinMax: true,
							},
							cancelable: false,
						})
						.on("positive", () => {
							if (
								DownloadDialog.getActionButton("positive") ==
								"确认"
							) {
								DownloadDialog.dismiss();
							} else {
								DownloadDialog.show();
							}
						})
						.show();
				});
				for (let i = 0; i < NewMaterialList.length; i++) {
					UPDATE.SaveImage(i, NewMaterialList);
				}
			} else {
				toastLog("获取材料失败");
			}
		});
	},
	SaveImage: function (i, NewMaterialList) {
		threads.start(function () {
			let res = http.get(
				"https://gitee.com/bukkumaaku/MRFZClick/raw/main/res/material/" +
					NewMaterialList[i] +
					".png"
			);
			files.writeBytes(
				"./res/material/" + NewMaterialList[i] + ".png",
				res.body.bytes()
			);
			log("更新第" + i + "个");
			UPDATE.DownloadNum++;
			DownloadDialog.setProgress(UPDATE.DownloadNum);
			if (UPDATE.DownloadNum == NewMaterialList.length) {
				files.write(
					"./MaterialName.json",
					UPDATE.NewMaterialFile,
					(encoding = "utf-8")
				);
				DownloadDialog.setActionButton("positive", "确认");
			}
		});
	},
};
module.exports = UPDATE;
