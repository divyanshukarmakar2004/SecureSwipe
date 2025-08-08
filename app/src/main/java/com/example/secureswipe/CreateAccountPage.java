package com.example.secureswipe;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;


public class CreateAccountPage extends AppCompatActivity {

    FirebaseAuth mAuth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_create_account_page);

        CardView create=findViewById(R.id.cardview1_createpage);
        EditText name=findViewById(R.id.edittext1_createpage);
        EditText email=findViewById(R.id.edittext2_createpage);
        EditText password=findViewById(R.id.edittext3_createpage);
        Spinner city=findViewById(R.id.spinner_createpage);

        mAuth = FirebaseAuth.getInstance();

        String[] items = {"Select City", "Delhi", "Mumbai", "Kolkata", "Chennai"};

        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_item,
                items
        );

        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);

        city.setAdapter(adapter);





        create.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {



                String nameInput=name.getText().toString();
                String emailInput=email.getText().toString();
                String passwordInput=password.getText().toString();
                String cityInput=city.getSelectedItem().toString();


                DatabaseReference databaseReference= FirebaseDatabase.getInstance().getReference("user");

                databaseReference.child(emailInput).child("name").setValue(nameInput);
                databaseReference.child(emailInput).child("city").setValue(cityInput);


                signUpUser(emailInput,passwordInput,nameInput,cityInput);





            }
        });


        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    public void signUpUser(String email,String password,String name,String city)
    {
        email=email+"@gmail.com";
        mAuth.createUserWithEmailAndPassword(email,password).addOnCompleteListener(new OnCompleteListener<AuthResult>() {
            @Override
            public void onComplete(@NonNull Task<AuthResult> task) {
                if (task.isSuccessful())
                {

                    startActivity(new Intent(CreateAccountPage.this,MainActivity.class));
                    Toast.makeText(CreateAccountPage.this, "Signed In", Toast.LENGTH_SHORT).show();
                }
                else
                {
                    Toast.makeText(CreateAccountPage.this, "Signup Failed", Toast.LENGTH_SHORT).show();
                }
            }
        });


    }

}