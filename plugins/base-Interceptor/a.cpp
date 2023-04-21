#include <iostream>
#include <fstream>
#include <map>
#include <list>
#include <jsoncpp/json/value.h>
#include <jsoncpp/json/json.h>

bool is_empty(std::ifstream& pFile)
{
    return pFile.peek() == std::ifstream::traits_type::eof();
}

int main() {
    // Prompt the user for some data
    std::string name;
    int age;
    bool isMarried;

    Json::StyledStreamWriter writer;
    std::list<Json::Value> dataList;

    // Open the input file stream to read JSON data from the file
    std::ifstream inputFile("myData.json");

    // Create a JSON object to store the list of maps
    Json::Value myData;

    if (!is_empty(inputFile))
    {
        // Read the JSON data from the input file stream
        inputFile >> myData;

        // Close the input file stream
        inputFile.close();

        // Iterate over the JSON data and add each map to the list
        for (const auto& map : myData) {
            dataList.push_back(map);
        }
    }

    while(true)
    {
        std::cout << "Enter your name: ";
        std::cin >> name;
        std::cout << "Enter your age: ";
        std::cin >> age;
        std::cout << "Are you married? (true/false): ";
        std::cin >> std::boolalpha >> isMarried;

        // Create a map to store the user's input
        Json::Value myMap;;
        myMap["name"] = name;
        myMap["age"] = std::to_string(age);
        myMap["isMarried"] = isMarried ? "true" : "false";

        // Add the map to the list
        dataList.push_back(myMap);

         // Open a file stream to write the JSON data to a file
        std::ofstream file("myData.json");

        // Create a JSON object to store the list of maps
        int index = 0;
        for (const auto& map : dataList) {
            myData[index++] = map;
        }

        // Write the JSON data to the file
        // Json::StyledStreamWriter writer;
        writer.write(file, myData);

        // Close the file stream
        file.close();

        std::cout << "Data has been written to myData.json" << std::endl;

    }

    return 0;
}