package com.example.secureswipe;

import okhttp3.*;

import org.json.JSONException;
import org.json.JSONObject;
import java.io.IOException;

public class FraudService {
    private static final String AGENT_BASE_URL = "http://172.20.10.12:8000";
    private static final OkHttpClient client = new OkHttpClient();

    public interface Callback {
        void onSuccess(String prediction, int riskScore, String mitigation, String pattern);
        void onFailure(Exception e);
    }

    public static void predict(
            int userId, String city,
            int year, int month, int day,
            String time, double amount,
            Callback cb
    ) {
        try {
            JSONObject json = new JSONObject();
            json.put("User",   userId);
            json.put("City",   city);
            json.put("Year",   year);
            json.put("Month",  month);
            json.put("Day",    day);
            json.put("Time",   time);
            json.put("Amount", amount);

            RequestBody body = RequestBody.create(
                    json.toString(),
                    MediaType.get("application/json; charset=utf-8")
            );

            Request req = new Request.Builder()
                    .url(AGENT_BASE_URL + "/predict")
                    .post(body)
                    .build();

            client.newCall(req).enqueue(new okhttp3.Callback() {
                @Override public void onFailure(Call call, IOException e) {
                    cb.onFailure(e);
                }
                @Override public void onResponse(Call call, Response resp) throws IOException {
                    if (!resp.isSuccessful()) {
                        cb.onFailure(new IOException("Unexpected " + resp));
                        return;
                    }
                    JSONObject o = null;
                    try {
                        o = new JSONObject(resp.body().string());
                    } catch (JSONException e) {
                        throw new RuntimeException(e);
                    }
                    try {
                        cb.onSuccess(
                                o.getString("prediction"),
                                o.optInt("risk_score", -1),
                                o.optString("mitigation", ""),
                                o.optString("pattern", "")
                        );
                    } catch (JSONException e) {
                        throw new RuntimeException(e);
                    }
                }
            });
        } catch (Exception ex) {
            cb.onFailure(ex);
        }
    }
}
