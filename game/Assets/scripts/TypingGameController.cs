using UnityEngine;
using TMPro;
using System.Collections;
public class TypingGameController : MonoBehaviour
{
    public TextMeshProUGUI backgroundText;
    public TextMeshProUGUI playerInputText;
    public TextMeshProUGUI rivalText;
    public float rivalTypingSpeed = 0.5f;

    private string targetText = "function binarySearch()\n{\n}";
    private int playerInputIndex = 0;
    private int rivalTypingIndex = 0;
    private bool isGameActive = true;

    void Start()
    {
        InitializeGame();
        StartCoroutine(SimulateRivalTyping());
    }
    void Update()
    {
        if (isGameActive)
        {
            HandlePlayerInput();
        }
    }
    private void InitializeGame()
    {
        backgroundText.text = targetText;
        playerInputText.text = string.Empty;
        rivalText.text = string.Empty;
    }
    private void HandlePlayerInput()
    {
        if (Input.anyKeyDown && playerInputIndex < targetText.Length)
        {
            char typedChar = Input.inputString.Length > 0 ? Input.inputString[0] : '\0';

            if (typedChar == targetText[playerInputIndex])
            {
                playerInputText.text += targetText[playerInputIndex];
                playerInputIndex++;

                if (playerInputIndex >= targetText.Length)
                {
                    isGameActive = false;
                    Debug.Log("Typing completed!");
                }
            }
            else if (Input.GetKeyDown(KeyCode.Backspace) && playerInputIndex > 0)
            {
                playerInputIndex--;
                playerInputText.text = playerInputText.text.Substring(0, playerInputIndex);
            }
        }

        if (Input.GetKeyDown(KeyCode.Return) && targetText[playerInputIndex] == '\n')
        {
            playerInputText.text += "\n";
            playerInputIndex++;
        }
    }
    private IEnumerator SimulateRivalTyping()
    {
        while (rivalTypingIndex < targetText.Length)
        {
            if (rivalTypingIndex < playerInputIndex)
            {
                rivalTypingIndex++;
                yield return null;
            }
            else
            {
                rivalText.text = targetText.Substring(0, rivalTypingIndex + 1);
                rivalTypingIndex++;
                yield return new WaitForSeconds(rivalTypingSpeed);
            }
        }
    }
}
