package com.example.secureswipe;

import android.Manifest;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.core.app.ActivityCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;

public class SendMoneyActivity extends AppCompatActivity {



    String city="";
    String randomItem = "";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_send_money);


        String[] user1_array = {"Imphal,Kharagpur","Ratlam","Ghaziabad"};

        String[] user2_array = {"Kollam","Aligarh","New Delhi","Allahbad"};




        Random rand = new Random();
        int randomIndex = rand.nextInt(user1_array.length); // random number from 0 to items.length - 1








        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 1);
            return;
        }

        String username = getIntent().getStringExtra("username");
        EditText amountBox=findViewById(R.id.edittext1_createpage);

        // Example: Show the username
        TextView usernameText = findViewById(R.id.text2_mainpage);
        usernameText.setText("To: "+username);


        if (username.equals("1"))
        {
            randomItem = user1_array[randomIndex];
        }
        else {
            randomItem = user2_array[randomIndex];

        }


        CardView send=findViewById(R.id.cardview1_createpage);


        FusedLocationProviderClient fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        fusedLocationClient.getLastLocation()
                .addOnSuccessListener(this, location -> {
                    if (location != null) {
                        double latitude = location.getLatitude();
                        double longitude = location.getLongitude();

                        // Now get city name
                        city=getCityFromCoordinates(latitude, longitude);
                    }
                });

        send.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                FirebaseAuth mAuth = FirebaseAuth.getInstance();
                FirebaseUser currentUser = mAuth.getCurrentUser();

                String email = currentUser.getEmail();

                int index=email.indexOf('@');

                String new_email=email.substring(0,index);

                long currentTimeMillis = System.currentTimeMillis();
                String timeId=""+currentTimeMillis;
                String amount=amountBox.getText().toString();

                LocalDate currentDate = LocalDate.now();
                String formattedDate = currentDate.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));

                Map<String,Object> txData=new HashMap<>();

                Calendar cal   = Calendar.getInstance();
                int    year   = cal.get(Calendar.YEAR);
                int    month  = cal.get(Calendar.MONTH) + 1;
                int    day    = cal.get(Calendar.DAY_OF_MONTH);
                String time   = new SimpleDateFormat("HH:mm", Locale.getDefault())
                        .format(cal.getTime());
                double amountValue = Double.parseDouble(amountBox.getText().toString());
                int number = Integer.parseInt(new_email);
                txData.put("User",number);
                txData.put("City",randomItem);
                txData.put("Amount",amountValue);
                txData.put("Year",   year);
                txData.put("Month",  month);
                txData.put("Day",    day);
                txData.put("Time",   time);


                FraudService.predict(
                        (int)txData.get("User"),
                        (String)txData.get("City"),
                        (int)txData.get("Year"),
                        (int)txData.get("Month"),
                        (int)txData.get("Day"),
                        (String)txData.get("Time"),
                        (double)txData.get("Amount"),
                        new FraudService.Callback() {
                            @Override
                            public void onSuccess(String prediction, int riskScore,
                                                  String mitigation, String pattern) {
                                runOnUiThread(() -> {
                                    String msg = prediction.equals("FRAUD")
                                            ? "⚠ Fraud! " + mitigation
                                            : "✔ OK (score " + riskScore + ")";
                                    Toast.makeText(SendMoneyActivity.this, msg, Toast.LENGTH_LONG).show();

                                    if (prediction.equals("FRAUD"))
                                    {
                                        FirebaseDatabase
                                                .getInstance()
                                                .getReference("flagged transactions")
                                                .push().setValue(txData);

                                        showAlert();



                                    }
                                    else {
                                        Toast.makeText(SendMoneyActivity.this, "Correct Transaction", Toast.LENGTH_SHORT).show();

                                    }


                                });
                            }

                            @Override
                            public void onFailure(Exception e) {
                                runOnUiThread(() ->
                                        Toast.makeText(SendMoneyActivity.this, "Fraud check failed: " + e, Toast.LENGTH_SHORT).show()
                                );
                            }
                        }
                );








                FirebaseDatabase.getInstance()
                        .getReference("user")
                        .child(new_email)
                        .child("sendTransaction").child(timeId).child("amount").setValue(amount);
                 FirebaseDatabase.getInstance()
                        .getReference("user")
                        .child(new_email)
                        .child("sendTransaction").child(timeId).child("location").setValue(randomItem);

                FirebaseDatabase.getInstance()
                        .getReference("user")
                        .child(new_email)
                        .child("sendTransaction").child(timeId).child("date").setValue(formattedDate);


                Toast.makeText(SendMoneyActivity.this, "Money Sent", Toast.LENGTH_SHORT).show();
                amountBox.setText("");

            }
        });








        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    private String getCityFromCoordinates(double lat, double lon) {
        Geocoder geocoder = new Geocoder(this, Locale.getDefault());
        String city="";
        try {
            List<Address> addresses = geocoder.getFromLocation(lat, lon, 1);
            if (addresses != null && !addresses.isEmpty()) {
                city = addresses.get(0).getLocality(); // This is the city
                Toast.makeText(this, "City: " + city, Toast.LENGTH_LONG).show();

            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return city;
    }


    private void showAlert() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);

        builder.setTitle("Alert");
        builder.setMessage("Fraud Alert");

        // Positive button
        builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                // Action when OK is pressed
                dialog.dismiss();
            }
        });

        // Negative button (optional)
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
            }
        });

        // Show the alert
        AlertDialog dialog = builder.create();
        dialog.show();
    }

}