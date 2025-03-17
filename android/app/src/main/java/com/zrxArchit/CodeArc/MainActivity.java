package com.zrxArchit.CodeArc;

import com.getcapacitor.BridgeActivity;
import android.app.AlertDialog;
import android.content.DialogInterface;

public class MainActivity extends BridgeActivity {
    @Override
    public void onBackPressed() {
        if (bridge.getWebView().canGoBack()) {
            bridge.getWebView().goBack();
        } else {
            new AlertDialog.Builder(this)
                .setTitle("Exit App")
                .setMessage("Are you sure you want to exit?")
                .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        finishAffinity();
                    }
                })
                .setNegativeButton("No", null)
                .show();
        }
    }
}
