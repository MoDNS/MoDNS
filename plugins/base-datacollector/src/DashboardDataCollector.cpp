#include "modns-sdk.hpp"
#include <iostream>
#include <fstream>
#include <map>
#include <list>
#include <jsoncpp/json/value.h>
#include <jsoncpp/json/json.h>

bool is_empty(std::ifstream &pFile)
{
    return pFile.peek() == std::ifstream::traits_type::eof();
}

extern uint8_t impl_inspect_resp(const struct DnsMessage *req,
                                 const struct DnsMessage *resp,
                                 uint8_t source,
                                 const void *plugin_state)
{

    std::cout << req;
    std::cout << resp;

    Json::StyledStreamWriter writer;
    std::list<Json::Value> dataList;

    // // Open the input file stream to read JSON data from the file
    std::ifstream inputFile("myData.json");

    // // Create a JSON object to store the list of maps
    // Json::Value myData;

    // if (!is_empty(inputFile))
    // {
    //     // Read the JSON data from the input file stream
    //     inputFile >> myData;

    //     // Close the input file stream
    //     inputFile.close();

    //     // Iterate over the JSON data and add each map to the list
    //     for (const auto &map : myData)
    //     {
    //         dataList.push_back(map);
    //     }
    // }
    // // Create a map to store the user's input
    // Json::Value myMap;

    // // Add the map to the list
    // if (dataList.size() <= 10000)
    // {
    //     dataList.push_back(myMap);
    // }
    // else
    // {
    //     dataList.pop_front();
    //     dataList.push_back(myMap);
    // }

    // Open a file stream to write the JSON data to a file
    std::ofstream file("myData.json");

    // // Create a JSON object to store the list of maps
    // int index = 0;
    // for (const auto &map : dataList)
    // {
    //     myData[index++] = map;
    // }

    // Write the JSON data to the file
    // Json::StyledStreamWriter writer;
    writer.write(file, req);
    writer.write(file, resp);

    // Close the file stream
    file.close();

    std::cout << "Data has been written to myData.json" << std::endl;

    std::cout << dataList.size() << std::endl;

    return 1;
}
