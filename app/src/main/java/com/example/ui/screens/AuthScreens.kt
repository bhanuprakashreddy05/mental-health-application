package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.PeaceAccent
import com.example.ui.theme.PeacePrimary
import com.example.ui.theme.PeaceSecondary
import com.example.ui.viewmodel.PeaceMindViewModel

@Composable
fun LoginScreen(
    viewModel: PeaceMindViewModel,
    onNavigateToRegister: () -> Unit,
    onLoginSuccess: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var rememberMe by remember { mutableStateOf(true) }

    var forgotPasswordDialogOpen by remember { mutableStateOf(false) }
    var recoveryEmail by remember { mutableStateOf("") }
    var recoveryNewPass by remember { mutableStateOf("peace123") }

    val errorMessage by viewModel.tempErrorMessage.collectAsState()
    val successMessage by viewModel.tempSuccessMessage.collectAsState()
    val isAuthenticating by viewModel.isAuthenticating.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.background,
                        MaterialTheme.colorScheme.background,
                        PeacePrimary.copy(alpha = 0.15f)
                    )
                )
            )
            .windowInsetsPadding(WindowInsets.safeDrawing)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Spacer(modifier = Modifier.height(48.dp))

            // Logo Icon Placeholder
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(PeacePrimary, PeaceSecondary)
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.Spa,
                    contentDescription = "Peace Mind Logo",
                    tint = Color.White,
                    modifier = Modifier.size(44.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Peace Mind",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                textAlign = TextAlign.Center
            )

            Text(
                text = "Your quiet space for self-care & reflection",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Status notice displays
            errorMessage?.let { error ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(imageVector = Icons.Default.Error, contentDescription = "Error", tint = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = error, fontSize = 14.sp, color = MaterialTheme.colorScheme.onErrorContainer)
                    }
                }
            }

            successMessage?.let { success ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(imageVector = Icons.Default.CheckCircle, contentDescription = "Success", tint = PeacePrimary)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = success, fontSize = 14.sp, color = MaterialTheme.colorScheme.onPrimaryContainer)
                    }
                }
            }

            // Input Fields
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email Address") },
                leadingIcon = { Icon(Icons.Outlined.Email, contentDescription = "Email") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("login_email_input"),
                shape = RoundedCornerShape(16.dp),
                singleLine = true,
                enabled = !isAuthenticating,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                leadingIcon = { Icon(Icons.Outlined.Lock, contentDescription = "Password") },
                trailingIcon = {
                    val icon = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(icon, contentDescription = "Toggle password visibility")
                    }
                },
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("login_password_input"),
                shape = RoundedCornerShape(16.dp),
                singleLine = true,
                enabled = !isAuthenticating,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable(enabled = !isAuthenticating) { rememberMe = !rememberMe }
                ) {
                    Checkbox(
                        checked = rememberMe,
                        onCheckedChange = { rememberMe = it },
                        modifier = Modifier.testTag("login_remember_checkbox"),
                        enabled = !isAuthenticating
                    )
                    Text("Remember Me", fontSize = 14.sp)
                }

                Text(
                    text = "Forgot Password?",
                    fontSize = 14.sp,
                    color = PeacePrimary,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier
                        .clickable(enabled = !isAuthenticating) {
                            forgotPasswordDialogOpen = true
                        }
                        .testTag("login_forgot_password")
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Main Email/Password Sign-In
            Button(
                onClick = {
                    val emailTrim = email.trim()
                    val passTrim = password.trim()
                    if (emailTrim.isEmpty()) {
                        viewModel.setErrorMessage("Email address cannot be empty.")
                    } else if (!emailTrim.contains("@") || !emailTrim.substringAfter("@").contains(".")) {
                        viewModel.setErrorMessage("Please enter a valid email address.")
                    } else if (passTrim.isEmpty()) {
                        viewModel.setErrorMessage("Password cannot be empty.")
                    } else if (passTrim.length < 6) {
                        viewModel.setErrorMessage("Password must be at least 6 characters.")
                    } else {
                        viewModel.login(emailTrim, passTrim, onLoginSuccess)
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .testTag("login_button"),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PeacePrimary),
                enabled = !isAuthenticating
            ) {
                if (isAuthenticating) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Login", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Direct Guest Demo Bypass
            TextButton(
                onClick = {
                    email = "demo@peacemind.com"
                    password = "demo"
                    viewModel.login("demo@peacemind.com", "demo", onLoginSuccess)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("demo_guest_button"),
                enabled = !isAuthenticating
            ) {
                Text(
                    text = "Try Demo Guest Session (Instant Setup)",
                    color = PeaceSecondary,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Alternative Quick Google Sign-In button
            OutlinedButton(
                onClick = {
                    viewModel.register("Google Companion", "google-user@peacemind.com", "oauthPass", onLoginSuccess)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .testTag("google_login_button"),
                shape = RoundedCornerShape(16.dp),
                enabled = !isAuthenticating
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Fingerprint,
                        contentDescription = "Fingerprint OAuth Logo",
                        tint = PeaceSecondary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Sign in with Google", color = MaterialTheme.colorScheme.onSurface)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Row(horizontalArrangement = Arrangement.Center) {
                Text("Don't have an account? ", color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f))
                Text(
                    text = "Sign Up",
                    color = PeaceSecondary,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .clickable(enabled = !isAuthenticating) { onNavigateToRegister() }
                        .testTag("navigate_register_button")
                )
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }

    // Recover / Reset Password Dialog Modal
    if (forgotPasswordDialogOpen) {
        AlertDialog(
            onDismissRequest = { forgotPasswordDialogOpen = false },
            title = {
                Text("Reset Password", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = MaterialTheme.colorScheme.onSurface)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        "Enter the registered email and choose a temporary password to recover access instantly:",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                    OutlinedTextField(
                        value = recoveryEmail,
                        onValueChange = { recoveryEmail = it },
                        label = { Text("Account Registered Email") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("recovery_email_input"),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                    )
                    OutlinedTextField(
                        value = recoveryNewPass,
                        onValueChange = { recoveryNewPass = it },
                        label = { Text("New Secure Password") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("recovery_new_pass_input"),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val recEmail = recoveryEmail.trim()
                        val recPass = recoveryNewPass.trim()
                        if (recEmail.isEmpty() || !recEmail.contains("@")) {
                            viewModel.setErrorMessage("Please enter a valid recovery email address.")
                        } else if (recPass.length < 6) {
                            viewModel.setErrorMessage("Temp password must be at least 6 characters.")
                        } else {
                            viewModel.forgotPassword(recEmail, recPass) {
                                forgotPasswordDialogOpen = false
                            }
                        }
                    }
                ) {
                    Text("Recover Password")
                }
            },
            dismissButton = {
                TextButton(onClick = { forgotPasswordDialogOpen = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun RegisterScreen(
    viewModel: PeaceMindViewModel,
    onNavigateToLogin: () -> Unit,
    onRegisterSuccess: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    val errorMessage by viewModel.tempErrorMessage.collectAsState()
    val isAuthenticating by viewModel.isAuthenticating.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.background,
                        MaterialTheme.colorScheme.background,
                        PeaceSecondary.copy(alpha = 0.15f)
                    )
                )
            )
            .windowInsetsPadding(WindowInsets.safeDrawing)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Spacer(modifier = Modifier.height(32.dp))

            Text(
                text = "Join Peace Mind",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                textAlign = TextAlign.Center
            )

            Text(
                text = "Begin your healing and mindful routine today",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            errorMessage?.let { error ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(imageVector = Icons.Default.Error, contentDescription = "Error", tint = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = error, fontSize = 14.sp, color = MaterialTheme.colorScheme.onErrorContainer)
                    }
                }
            }

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Full Name") },
                leadingIcon = { Icon(Icons.Outlined.Person, contentDescription = "Person") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("register_name_input"),
                shape = RoundedCornerShape(16.dp),
                enabled = !isAuthenticating,
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email Address") },
                leadingIcon = { Icon(Icons.Outlined.Email, contentDescription = "Email") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("register_email_input"),
                shape = RoundedCornerShape(16.dp),
                enabled = !isAuthenticating,
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                leadingIcon = { Icon(Icons.Outlined.Lock, contentDescription = "Password") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("register_password_input"),
                shape = RoundedCornerShape(16.dp),
                enabled = !isAuthenticating,
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                label = { Text("Confirm Password") },
                leadingIcon = { Icon(Icons.Outlined.Lock, contentDescription = "Confirm Password") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("register_confirm_password_input"),
                shape = RoundedCornerShape(16.dp),
                enabled = !isAuthenticating,
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Main Registration Action
            Button(
                onClick = {
                    val nameTrim = name.trim()
                    val emailTrim = email.trim()
                    val passTrim = password.trim()
                    val confPassTrim = confirmPassword.trim()

                    if (nameTrim.isEmpty()) {
                        viewModel.setErrorMessage("Full Name cannot be empty.")
                    } else if (emailTrim.isEmpty()) {
                        viewModel.setErrorMessage("Email address cannot be empty.")
                    } else if (!emailTrim.contains("@") || !emailTrim.substringAfter("@").contains(".")) {
                        viewModel.setErrorMessage("Please enter a valid email address.")
                    } else if (passTrim.isEmpty()) {
                        viewModel.setErrorMessage("Password cannot be empty.")
                    } else if (passTrim.length < 6) {
                        viewModel.setErrorMessage("Password must be at least 6 characters.")
                    } else if (passTrim != confPassTrim) {
                        viewModel.setErrorMessage("Passwords do not match. Confirm Password must match exactly.")
                    } else {
                        viewModel.register(nameTrim, emailTrim, passTrim, onRegisterSuccess)
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .testTag("register_button"),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PeaceSecondary),
                enabled = !isAuthenticating
            ) {
                if (isAuthenticating) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Create Account", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedButton(
                onClick = {
                    viewModel.register("Google Seeker", "google@peacemind.com", "onepass", onRegisterSuccess)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .testTag("google_signup_button"),
                shape = RoundedCornerShape(16.dp),
                enabled = !isAuthenticating
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.AddReaction,
                        contentDescription = "Reaction",
                        tint = PeaceAccent,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Sign up with Google", color = MaterialTheme.colorScheme.onSurface)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Row(horizontalArrangement = Arrangement.Center) {
                Text("Already have an account? ", color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f))
                Text(
                    text = "Log In",
                    color = PeacePrimary,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .clickable(enabled = !isAuthenticating) { onNavigateToLogin() }
                        .testTag("navigate_login_button")
                )
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
