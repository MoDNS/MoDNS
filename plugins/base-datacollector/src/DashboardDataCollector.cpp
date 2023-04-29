#include "modns-sdk.hpp"
#include <iostream>
#include <fstream>
#include <map>
#include <list>
#include <jsoncpp/json/value.h>
#include <jsoncpp/json/json.h>

/*
Structure of DNS Message
    struct DnsMessage {
        uint16_t id;
        bool is_response;
        uint16_t opcode;
        bool authoritative_answer;
        bool truncation;
        bool recursion_desired;
        bool recursion_available;
        uint16_t response_code;
        QuestionVector questions;
        RRVector answers;
        RRVector authorities;
        RRVector additional;
    };
*/

bool is_empty(std::ifstream &pFile)
{
    return pFile.peek() == std::ifstream::traits_type::eof();
}

extern "C" uint8_t impl_inspect_resp(const modns_sdk::DnsMessage *req,
                                     const modns_sdk::DnsMessage *resp,
                                     uint8_t source,
                                     const void *plugin_state)
{

    // Create a map to store the user's input
    Json::Value myMap;

    myMap["id"] = req->id;
    myMap["is_response"] = req->is_response;
    myMap["opcode"] = req->opcode;
    myMap["authoritative_answer"] = req->authoritative_answer;
    myMap["truncation"] = req->truncation;
    myMap["recursion_desired"] = req->recursion_desired;
    myMap["recursion_available"] = req->recursion_available;
    myMap["response_code"] = req->response_code;

    std::list<Json::Value> dataList;

    // Open the input file stream to read JSON data from the file
    // std::ifstream inputFile("../myData.json");

    // Create a JSON object to store the list of maps
    Json::Value myData;
/*
    if (!is_empty(inputFile))
    {
        // Read the JSON data from the input file stream
        inputFile >> myData;

        // Close the input file stream
        inputFile.close();

        // Iterate over the JSON data and add each map to the list
        for (const auto &map : myData)
        {
            dataList.push_back(map);
        }
    }

    // Add the map to the list
    if (dataList.size() <= 1000)
    {
        dataList.push_back(myMap);
    }
    else
    {
        dataList.pop_front();
        dataList.push_back(myMap);
    }

    inputFile.close();
*/
    std::cout << "\n\n\n";

    // for (auto const &i : dataList)
    // {
    //     std::cout << i["id"] << std::endl;
    // }

    // Open a file stream to write the JSON data to a file
    // std::ofstream file("../myData.json");

    // Create a JSON object to store the list of maps
    int index = 0;
    for (const auto &map : dataList)
    {
        myData[index++] = map;
    }

    std::cout << "\n\n\n";

    for (auto const &i : myData)
    {
        std::cout << i["id"] << std::endl;
    }

    // Write the JSON data to the file
    // Json::StyledStreamWriter dataWriter;
    // file << dataWriter.write(dataList);

    // Close the file stream
    // file.close();

    std::cout << "Data has been written to myData.json" << std::endl;

    // std::string sStyled = styled.write(myData);
    // cout << "Styled stream:\n";

    // Json::StyledStreamWriter styledStream;
    // styledStream.write(std::cout, myData);

    std::cout << dataList.size() << std::endl;

    std::cout << "Printed \n";
    return 0;
}
